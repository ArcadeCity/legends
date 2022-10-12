import '@tamagui/core/reset.css'
import '@tamagui/font-inter/css/400.css'
import '@tamagui/font-inter/css/700.css'

import * as Fathom from 'fathom-client'
import { NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { Provider } from 'app/provider'
import Head from 'next/head'
import React, { useEffect, useMemo } from 'react'
import type { SolitoAppProps } from 'solito'
import 'raf/polyfill'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }: SolitoAppProps) {
  const [theme, setTheme] = useRootTheme()
  const router = useRouter()

  const contents = useMemo(() => {
    return <Component {...pageProps} />
  }, [pageProps])

  useEffect(() => {
    // Initialize Fathom when the app loads
    Fathom.load('HRLSLWOY', {
      includedDomains: ['legends.arcade.city'],
      url: 'https://abacus.arcade.city/script.js',
    })

    function onRouteChangeComplete() {
      Fathom.trackPageview()
    }
    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <title>Arcade @ Legends</title>
        <meta name="description" content="Placeholder!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NextThemeProvider onChangeTheme={setTheme}>
        <Provider disableRootThemeClass defaultTheme={theme}>
          {contents}
        </Provider>
      </NextThemeProvider>
    </>
  )
}

export default MyApp
