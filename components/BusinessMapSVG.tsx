// BusinessMapSVG.tsx
import React from "react";
import { Image, StyleSheet } from "react-native";

export const BusinessMapSVG: React.FC = () => {
  return (
    <Image
      source={require('../assets/business-map.webp')} // Adjust path as needed
      style={businessMapSVGStyles.image}
      accessibilityLabel="Business Map"
    />
  );
};

export default BusinessMapSVG;

const businessMapSVGStyles = StyleSheet.create({
  image: {
    height: '100%',
    left: 0,
    position: 'absolute',
    resizeMode: 'cover',
    top: 0,
    width: '100%', // object-cover
    // pointer-events-none is not directly applicable, but Image is not interactive by default
  },
});