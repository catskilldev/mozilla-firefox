/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * Copyright (C) 2002-2017 Németh László
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Hunspell is based on MySpell which is Copyright (C) 2002 Kevin Hendricks.
 *
 * Contributor(s): David Einstein, Davide Prina, Giuseppe Modugno,
 * Gianluca Turconi, Simon Brouwer, Noll János, Bíró Árpád,
 * Goldman Eleonóra, Sarlós Tamás, Bencsáth Boldizsár, Halácsy Péter,
 * Dvornik László, Gefferth András, Nagy Viktor, Varga Dániel, Chris Halls,
 * Rene Engelhard, Bram Moolenaar, Dafydd Jones, Harri Pitkänen
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
/*
 * Copyright 2002 Kevin B. Hendricks, Stratford, Ontario, Canada
 * And Contributors.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * 3. All modifications to the source code must be clearly marked as
 *    such.  Binary redistributions based on modified source code
 *    must be clearly marked as modified versions in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY KEVIN B. HENDRICKS AND CONTRIBUTORS
 * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL
 * KEVIN B. HENDRICKS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */
#include "hunspell_csutil.hxx"
#include "mozilla/Encoding.h"
#include "mozilla/Span.h"
#include "nsUnicharUtils.h"

/* This is a copy of get_current_cs from the hunspell csutil.cxx file.
 */
struct cs_info* hunspell_get_current_cs(const std::string& es) {
  struct cs_info* ccs = new cs_info[256];
  // Initialze the array with dummy data so that we wouldn't need
  // to return null in case of failures.
  for (int i = 0; i <= 0xff; ++i) {
    ccs[i].ccase = false;
    ccs[i].clower = i;
    ccs[i].cupper = i;
  }

  auto encoding = mozilla::Encoding::ForLabelNoReplacement(es);
  if (!encoding) {
    return ccs;
  }
  auto encoder = encoding->NewEncoder();
  auto decoder = encoding->NewDecoderWithoutBOMHandling();

  for (unsigned int i = 0; i <= 0xff; ++i) {
    bool success = false;
    // We want to find the upper/lowercase equivalents of each byte
    // in this 1-byte character encoding.  Call our encoding/decoding
    // APIs separately for each byte since they may reject some of the
    // bytes, and we want to handle errors separately for each byte.
    uint8_t lower, upper;
    do {
      if (i == 0) break;
      uint8_t source = uint8_t(i);
      char16_t uni[2];
      char16_t uniCased;
      uint8_t destination[4];
      auto src1 = mozilla::Span(&source, 1);
      auto dst1 = mozilla::Span(uni);
      auto src2 = mozilla::Span(&uniCased, 1);
      auto dst2 = mozilla::Span(destination);

      uint32_t result;
      size_t read;
      size_t written;
      std::tie(result, read, written) =
          decoder->DecodeToUTF16WithoutReplacement(src1, dst1, true);
      if (result != mozilla::kInputEmpty || read != 1 || written != 1) {
        break;
      }

      uniCased = ToLowerCase(uni[0]);
      std::tie(result, read, written) =
          encoder->EncodeFromUTF16WithoutReplacement(src2, dst2, true);
      if (result != mozilla::kInputEmpty || read != 1 || written != 1) {
        break;
      }
      lower = destination[0];

      uniCased = ToUpperCase(uni[0]);
      std::tie(result, read, written) =
          encoder->EncodeFromUTF16WithoutReplacement(src2, dst2, true);
      if (result != mozilla::kInputEmpty || read != 1 || written != 1) {
        break;
      }
      upper = destination[0];

      success = true;
    } while (0);

    encoding->NewEncoderInto(*encoder);
    encoding->NewDecoderWithoutBOMHandlingInto(*decoder);

    if (success) {
      ccs[i].cupper = upper;
      ccs[i].clower = lower;
    } else {
      ccs[i].cupper = i;
      ccs[i].clower = i;
    }

    if (ccs[i].clower != (unsigned char)i)
      ccs[i].ccase = true;
    else
      ccs[i].ccase = false;
  }

  return ccs;
}
