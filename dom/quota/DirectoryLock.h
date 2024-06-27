/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef DOM_QUOTA_DIRECTORYLOCK_H_
#define DOM_QUOTA_DIRECTORYLOCK_H_

#include "nsTArrayForwardDeclare.h"
#include "mozilla/dom/Nullable.h"
#include "mozilla/dom/quota/Client.h"
#include "mozilla/dom/quota/PersistenceType.h"

template <class T>
class RefPtr;

namespace mozilla::dom::quota {

class ClientDirectoryLock;
enum class DirectoryLockCategory : uint8_t;
struct OriginMetadata;

// Basic directory lock interface shared by all other directory lock classes.
// The class must contain pure virtual functions only to avoid problems with
// multiple inheritance.
class NS_NO_VTABLE DirectoryLock {
 public:
  NS_INLINE_DECL_PURE_VIRTUAL_REFCOUNTING

  virtual int64_t Id() const = 0;

  virtual DirectoryLockCategory Category() const = 0;

  virtual bool Acquired() const = 0;

  virtual bool MustWait() const = 0;

  virtual nsTArray<RefPtr<DirectoryLock>> LocksMustWaitFor() const = 0;

  virtual bool Dropped() const = 0;

  virtual RefPtr<BoolPromise> Acquire() = 0;

  virtual void AcquireImmediately() = 0;

  virtual void AssertIsAcquiredExclusively() = 0;

  virtual RefPtr<BoolPromise> Drop() = 0;

  virtual void OnInvalidate(std::function<void()>&& aCallback) = 0;

  virtual void Log() const = 0;
};

// A directory lock specialized for a given origin directory.
class NS_NO_VTABLE OriginDirectoryLock : public DirectoryLock {
 public:
  // 'Get' prefix is to avoid name collisions with the enum
  virtual PersistenceType GetPersistenceType() const = 0;

  virtual quota::OriginMetadata OriginMetadata() const = 0;

  virtual const nsACString& Origin() const = 0;
};

// A directory lock specialized for a given client directory (inside an origin
// directory).
class NS_NO_VTABLE ClientDirectoryLock : public OriginDirectoryLock {
 public:
  virtual Client::Type ClientType() const = 0;
};

// A directory lock for universal use. A universal lock can handle any possible
// combination of nullable persistence type, origin scope and nullable client
// type.
//
// For example, if the persistence type is set to null, origin scope is null
// and the client type is set to Client::IDB, then the lock will cover
// <profile>/storage/*/*/idb
//
// If no property is set, then the lock will cover the entire storage directory
// and its subdirectories.
class UniversalDirectoryLock : public DirectoryLock {
 public:
  // XXX Rename to NullablePersistenceTypeRef.
  virtual const Nullable<PersistenceType>& NullablePersistenceType() const = 0;

  // XXX Rename to OriginScopeRef.
  virtual const OriginScope& GetOriginScope() const = 0;

  // XXX Rename to NullableClientTypeRef.
  virtual const Nullable<Client::Type>& NullableClientType() const = 0;

  virtual RefPtr<ClientDirectoryLock> SpecializeForClient(
      PersistenceType aPersistenceType, const OriginMetadata& aOriginMetadata,
      Client::Type aClientType) const = 0;
};

template <typename T>
constexpr void SafeDropDirectoryLock(RefPtr<T>& aDirectoryLock);

template <typename T>
constexpr void DropDirectoryLock(RefPtr<T>& aDirectoryLock);

template <typename T>
constexpr void SafeDropDirectoryLockIfNotDropped(RefPtr<T>& aDirectoryLock);

template <typename T>
constexpr void DropDirectoryLockIfNotDropped(RefPtr<T>& aDirectoryLock);

}  // namespace mozilla::dom::quota

#endif  // DOM_QUOTA_DIRECTORYLOCK_H_
