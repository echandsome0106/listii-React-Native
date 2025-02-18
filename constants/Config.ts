import {
    Dimensions,
    Platform,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
// const baseFontSize = Math.min(screenWidth, screenHeight) * 0.038;
const baseFontSize = 15.2;
const isSmallScreen = screenWidth < 375;

export  {
    screenWidth,
    screenHeight,
    baseFontSize,
    isSmallScreen
}