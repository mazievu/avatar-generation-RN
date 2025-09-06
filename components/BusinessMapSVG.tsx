// BusinessMapSVG.tsx
import React from "react";
import { Image, StyleSheet } from "react-native";

export const BusinessMapSVG: React.FC = () => {
  return (
    <Image
      source={require('../public/asset/business-map.webp')} // Adjust path as needed
      style={businessMapSVGStyles.image}
      accessibilityLabel="Business Map"
    />
  );
};

export default BusinessMapSVG;

const businessMapSVGStyles = StyleSheet.create({
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // object-cover
    // pointer-events-none is not directly applicable, but Image is not interactive by default
  },
});