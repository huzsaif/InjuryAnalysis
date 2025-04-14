import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
  cssVarPrefix: 'recoverai',
};

const theme = extendTheme({
  config,
  styles: {
    global: (props: any) => ({
      html: {
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
      },
      body: {
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        bg: mode('gray.50', 'gray.900')(props),
        color: mode('gray.800', 'whiteAlpha.900')(props),
        transition: 'background-color 0.2s, color 0.2s',
      },
      '#root': {
        width: '100%',
        height: '100%',
      },
    }),
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    navy: {
      50: '#e6eaf0',
      100: '#c7d0dc',
      200: '#a5b3c7',
      300: '#8295b3',
      400: '#607fa3',
      500: '#496991',
      600: '#375380',
      700: '#254070',
      800: '#132e60',
      900: '#0c2340', // Navy blue to match the logo
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Container: {
      baseStyle: {
        maxW: '100%',
      },
    },
  },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </>
  );
}; 