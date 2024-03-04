import Link from "next/link";
import React, { ReactNode, useEffect, useState } from "react";
import { useHover } from "@mantine/hooks";
import { Text } from "@mantine/core";
// import './NextLink.css'

type NextLinkProps = {
  href: string;
  children: ReactNode;
  color?: string;
  hoveredColor?: string;
  fw?: "normal" | "lighter" | "bold" | "bolder" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  hoveredFW?: "normal" | "lighter" | "bold" | "bolder" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
};

const NextLink: React.FC<NextLinkProps> = ({
  href,
  children,
  color = "black",
  hoveredColor = "black",
  fw="normal",
  hoveredFW = "normal"
}) => {
  const { hovered, ref} = useHover();
  const [currentLinkColor, setCurrentLinkColor] = useState<string>(color);
  const [fontWeight, setFontWeight] = useState<string>(color);
  useEffect(()=>{
    setCurrentLinkColor(hovered?hoveredColor:color);
    setFontWeight(hovered?hoveredFW:fw);
  },[hovered]) 
  return (
    <Text ref={ref} fw={fontWeight}>
      <Link href={href}  style={{ color: currentLinkColor, textDecoration: "none" }}>
        {children}
      </Link>
    </Text>
  );
};

export default NextLink;
