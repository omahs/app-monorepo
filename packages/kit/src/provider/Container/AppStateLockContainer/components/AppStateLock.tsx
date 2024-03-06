import { memo } from 'react';

import type { IThemeableStackProps } from '@onekeyhq/components';
import {
  Button,
  Heading,
  IconButton,
  Image,
  Stack,
  ThemeableStack,
  useSafeAreaInsets,
} from '@onekeyhq/components';
import Logo from '@onekeyhq/kit/assets/logo_round_decorated.png';

interface IAppStateLockProps extends IThemeableStackProps {
  passwordVerifyContainer: React.ReactNode;
  onWebAuthVerify: () => void;
  enableWebAuth: boolean;
}

const AppStateLock = ({
  passwordVerifyContainer,
  onWebAuthVerify,
  enableWebAuth,
  ...props
}: IAppStateLockProps) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <ThemeableStack
      position="absolute"
      fullscreen
      flex={1}
      bg="$bgApp"
      {...props}
    >
      <Stack
        flex={1}
        justifyContent="center"
        alignItems="center"
        p="$8"
        space="$8"
      >
        <Stack space="$4" alignItems="center">
          <Image w={72} h={72} source={Logo} />
          <Heading size="$headingLg" textAlign="center">
            Welcome Back
          </Heading>
        </Stack>
        <Stack
          w="100%"
          $gtMd={{
            maxWidth: '$80',
          }}
        >
          {passwordVerifyContainer}
        </Stack>
        {enableWebAuth && (
          <IconButton icon="FaceArcSolid" onPress={onWebAuthVerify} />
        )}
      </Stack>
      <Stack py="$8" mb={bottom ?? 'unset'} alignItems="center">
        <Button size="small" variant="tertiary">
          Forgot Password?
        </Button>
      </Stack>
    </ThemeableStack>
  );
};

export default memo(AppStateLock);
