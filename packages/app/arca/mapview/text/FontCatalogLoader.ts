/*
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { FontCatalogConfig } from 'app/arca/datasource-protocol'
import { FontCatalog } from 'app/arca/text-canvas'
import { LoggerManager } from 'app/arca/utils'

const logger = LoggerManager.instance.create('FontCatalogLoader')

type FontCatalogCallback = (name: string, catalog: FontCatalog) => void

export async function loadFontCatalog(
  fontCatalogConfig: FontCatalogConfig,
  onSuccess: FontCatalogCallback,
  onError?: (error: Error) => void
): Promise<void> {
  // console.log('skipping font catalog loading')

  // return a promise that immediately resolves
  // return new Promise((resolve) => resolve())

  return await FontCatalog.load(fontCatalogConfig.url, 1024)
    .then<void>(onSuccess.bind(undefined, fontCatalogConfig.name))
    .catch((error: Error) => {
      logger.error('Failed to load FontCatalog: ', fontCatalogConfig.name, error)
      if (onError) {
        onError(error)
      }
    })
}
