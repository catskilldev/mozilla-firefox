/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
// Copyright (c) 2006-2008 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef BASE_TASK_H_
#define BASE_TASK_H_

#include "base/revocable_store.h"
#include "base/tuple.h"

#include "nsISupportsImpl.h"
#include "nsThreadUtils.h"

#include <type_traits>
#include <utility>

// Helper functions so that we can call a function a pass it arguments that come
// from a Tuple.

namespace details {

// Call the given method on the given object. Arguments are passed by move
// semantics from the given tuple. If the tuple has length N, the sequence must
// be IndexSequence<0, 1, ..., N-1>.
template <size_t... Indices, class ObjT, class Method, typename... Args>
void CallMethod(std::index_sequence<Indices...>, ObjT* obj, Method method,
                std::tuple<Args...>& arg) {
  (obj->*method)(std::move(std::get<Indices>(arg))...);
}

// Same as above, but call a function.
template <size_t... Indices, typename Function, typename... Args>
void CallFunction(std::index_sequence<Indices...>, Function function,
                  std::tuple<Args...>& arg) {
  (*function)(std::move(std::get<Indices>(arg))...);
}

}  // namespace details

// Call a method on the given object. Arguments are passed by move semantics
// from the given tuple.
template <class ObjT, class Method, typename... Args>
void DispatchTupleToMethod(ObjT* obj, Method method, std::tuple<Args...>& arg) {
  details::CallMethod(std::index_sequence_for<Args...>{}, obj, method, arg);
}

// Same as above, but call a function.
template <typename Function, typename... Args>
void DispatchTupleToFunction(Function function, std::tuple<Args...>& arg) {
  details::CallFunction(std::index_sequence_for<Args...>{}, function, arg);
}

// General task implementations ------------------------------------------------

// Task to delete an object
template <class T>
class DeleteTask : public mozilla::CancelableRunnable {
 public:
  explicit DeleteTask(T* obj)
      : mozilla::CancelableRunnable("DeleteTask"), obj_(obj) {}
  NS_IMETHOD Run() override {
    delete obj_;
    return NS_OK;
  }
  virtual nsresult Cancel() override {
    obj_ = NULL;
    return NS_OK;
  }

 private:
  T* MOZ_UNSAFE_REF(
      "The validity of this pointer must be enforced by "
      "external factors.") obj_;
};

// RunnableMethodTraits --------------------------------------------------------
//
// This traits-class is used by RunnableMethod to manage the lifetime of the
// callee object.  By default, it is assumed that the callee supports AddRef
// and Release methods.  A particular class can specialize this template to
// define other lifetime management.  For example, if the callee is known to
// live longer than the RunnableMethod object, then a RunnableMethodTraits
// struct could be defined with empty RetainCallee and ReleaseCallee methods.

template <class T>
struct RunnableMethodTraits {
  static void RetainCallee(T* obj) { obj->AddRef(); }
  static void ReleaseCallee(T* obj) { obj->Release(); }
};

// This allows using the NewRunnableMethod() functions with a const pointer
// to the callee object. See the similar support in nsRefPtr for a rationale
// of why this is reasonable.
template <class T>
struct RunnableMethodTraits<const T> {
  static void RetainCallee(const T* obj) { const_cast<T*>(obj)->AddRef(); }
  static void ReleaseCallee(const T* obj) { const_cast<T*>(obj)->Release(); }
};

// RunnableMethod and RunnableFunction -----------------------------------------
//
// Runnable methods are a type of task that call a function on an object when
// they are run. We implement both an object and a set of NewRunnableMethod and
// NewRunnableFunction functions for convenience. These functions are
// overloaded and will infer the template types, simplifying calling code.
//
// The template definitions all use the following names:
// T                - the class type of the object you're supplying
//                    this is not needed for the Static version of the call
// Method/Function  - the signature of a pointer to the method or function you
//                    want to call
// Param            - the parameter(s) to the method, possibly packed as a Tuple
// A                - the first parameter (if any) to the method
// B                - the second parameter (if any) to the mathod
//
// Put these all together and you get an object that can call a method whose
// signature is:
//   R T::MyFunction([A[, B]])
//
// Usage:
// PostTask(NewRunnableMethod(object, &Object::method[, a[, b]])
// PostTask(NewRunnableFunction(&function[, a[, b]])

// RunnableMethod and NewRunnableMethod implementation -------------------------

template <class T, class Method, class Params>
class RunnableMethod : public mozilla::CancelableRunnable,
                       public RunnableMethodTraits<T> {
 public:
  RunnableMethod(T* obj, Method meth, Params&& params)
      : mozilla::CancelableRunnable("RunnableMethod"),
        obj_(obj),
        meth_(meth),
        params_(std::forward<Params>(params)) {
    this->RetainCallee(obj_);
  }
  ~RunnableMethod() { ReleaseCallee(); }

  NS_IMETHOD Run() override {
    if (obj_) DispatchTupleToMethod(obj_, meth_, params_);
    return NS_OK;
  }

  virtual nsresult Cancel() override {
    ReleaseCallee();
    return NS_OK;
  }

 private:
  void ReleaseCallee() {
    if (obj_) {
      RunnableMethodTraits<T>::ReleaseCallee(obj_);
      obj_ = nullptr;
    }
  }

  // This is owning because of the RetainCallee and ReleaseCallee calls in the
  // constructor and destructor.
  T* MOZ_OWNING_REF obj_;
  Method meth_;
  Params params_;
};

namespace dont_add_new_uses_of_this {

// Don't add new uses of this!!!!
template <class T, class Method, typename... Args>
inline already_AddRefed<mozilla::Runnable> NewRunnableMethod(T* object,
                                                             Method method,
                                                             Args&&... args) {
  typedef std::tuple<std::decay_t<Args>...> ArgsTuple;
  RefPtr<mozilla::Runnable> t = new RunnableMethod<T, Method, ArgsTuple>(
      object, method, std::make_tuple(std::forward<Args>(args)...));
  return t.forget();
}

}  // namespace dont_add_new_uses_of_this

// RunnableFunction and NewRunnableFunction implementation ---------------------

template <class Function, class Params>
class RunnableFunction : public mozilla::CancelableRunnable {
 public:
  RunnableFunction(const char* name, Function function, Params&& params)
      : mozilla::CancelableRunnable(name),
        function_(function),
        params_(std::forward<Params>(params)) {}

  ~RunnableFunction() {}

  NS_IMETHOD Run() override {
    if (function_) DispatchTupleToFunction(function_, params_);
    return NS_OK;
  }

  virtual nsresult Cancel() override {
    function_ = nullptr;
    return NS_OK;
  }

  Function function_;
  Params params_;
};

template <class Function, typename... Args>
inline already_AddRefed<mozilla::CancelableRunnable>
NewCancelableRunnableFunction(const char* name, Function function,
                              Args&&... args) {
  typedef std::tuple<std::decay_t<Args>...> ArgsTuple;
  RefPtr<mozilla::CancelableRunnable> t =
      new RunnableFunction<Function, ArgsTuple>(
          name, function, std::make_tuple(std::forward<Args>(args)...));
  return t.forget();
}

template <class Function, typename... Args>
inline already_AddRefed<mozilla::Runnable> NewRunnableFunction(
    const char* name, Function function, Args&&... args) {
  typedef std::tuple<std::decay_t<Args>...> ArgsTuple;
  RefPtr<mozilla::Runnable> t = new RunnableFunction<Function, ArgsTuple>(
      name, function, std::make_tuple(std::forward<Args>(args)...));
  return t.forget();
}

#endif  // BASE_TASK_H_
