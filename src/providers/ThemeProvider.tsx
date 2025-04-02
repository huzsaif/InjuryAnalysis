import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
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
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}; 