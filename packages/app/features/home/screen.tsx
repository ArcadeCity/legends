import { Anchor, Button, H1, Paragraph, Separator, Sheet, XStack, YStack } from '@my/ui'
import { ChevronDown, ChevronUp } from '@tamagui/feather-icons'
import React, { useState } from 'react'
import { useLink } from 'solito/link'

export function HomeScreen() {
  const linkProps = useLink({
    href: '/user/nate',
  })

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <YStack space="$4" maw={600}>
        <H1 ta="center">Welcome to Tamagui.</H1>
        <Paragraph ta="center">
          Here's a basic starter to show navigating from one screen to another. This screen uses the
          same code on Next.js and React Native.
        </Paragraph>

        <Separator />
        <Paragraph ta="center">
          Tamagui is made by{' '}
          <Anchor href="https://twitter.com/natebirdman" target="_blank">
            Nate Wienert
          </Anchor>
          , give it a star{' '}
          <Anchor href="https://github.com/tamagui/tamagui" target="_blank" rel="noreferrer">
            on Github
          </Anchor>
          .
        </Paragraph>
      </YStack>

      <XStack>
        <Button {...linkProps}>Link to user</Button>
      </XStack>

      <SheetDemo />
    </YStack>
  )
}

export function SheetDemo() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)
  return (
    <>
      <Button
        size="$7"
        icon={open ? ChevronDown : ChevronUp}
        circular
        color="white"
        backgroundColor="rgba(0, 248, 248, 0.4)"
        hoverStyle={{
          backgroundColor: 'rgba(0, 248, 248, 0.6)',
          borderColor: 'rgba(0, 248, 248, 1)',
        }}
        borderColor="rgba(0, 248, 248, 0.8)"
        borderWidth={1}
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[90]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame
          ai="center"
          jc="center"
          backgroundColor="#120B29"
          borderTopColor="#46367C"
          borderWidth={1}
        >
          <Sheet.Handle />
          <Button
            size="$7"
            circular
            color="white"
            backgroundColor="rgba(0, 248, 248, 0.4)"
            hoverStyle={{
              backgroundColor: 'rgba(0, 248, 248, 0.6)',
              borderColor: 'rgba(0, 248, 248, 1)',
            }}
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
