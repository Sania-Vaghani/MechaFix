import { Text } from 'react-native';

// Helper to map fontWeight/fontStyle to the correct Poppins font
function getPoppinsFontFamily(style = {}) {
    const weight = style.fontWeight || 'normal';
    const fontStyle = style.fontStyle || 'normal';
    if (weight === 'bold' && fontStyle === 'italic') return 'Poppins-BoldItalic';
    if (weight === 'bold') return 'Poppins-Bold';
    if (weight === '600' && fontStyle === 'italic') return 'Poppins-SemiBoldItalic';
    if (weight === '600') return 'Poppins-SemiBold';
    if (weight === '500' && fontStyle === 'italic') return 'Poppins-MediumItalic';
    if (weight === '500') return 'Poppins-Medium';
    if (weight === '300' && fontStyle === 'italic') return 'Poppins-LightItalic';
    if (weight === '300') return 'Poppins-Light';
    if (weight === '200' && fontStyle === 'italic') return 'Poppins-ExtraLightItalic';
    if (weight === '200') return 'Poppins-ExtraLight';
    if (weight === '100' && fontStyle === 'italic') return 'Poppins-ThinItalic';
    if (weight === '100') return 'Poppins-Thin';
    if (fontStyle === 'italic') return 'Poppins-Italic';
    return 'Poppins-Regular';
}

function CustomText({ style, children, ...props }) {
    // Flatten style array if needed
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
    // Use fontFamily from style if present, otherwise use Poppins mapping
    const fontFamily = flatStyle.fontFamily || getPoppinsFontFamily(flatStyle);
    return (
        <Text style={[style, { fontFamily }]} {...props}>
            {children}
        </Text>
    );
}

export default CustomText;