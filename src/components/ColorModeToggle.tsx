import { useColorMode, Tooltip, IconButton } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

export const ColorModeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <Tooltip
      label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label="Color mode toggle"
      placement="bottom"
    >
      <IconButton
        aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        colorScheme="whiteAlpha"
        fontSize="lg"
        size="md"
        borderRadius="md"
        _hover={{
          bg: 'whiteAlpha.300',
        }}
      />
    </Tooltip>
  );
}; 