import React from "react";
export const SnoozeLink = ({
  title,
  onClick,
  className
}: {
  title: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  className?: string;
}) => (
  <a href="#" className={"dib pa2 link avenir " + className} onClick={onClick}>
    <div style={{ cursor: "pointer" }}>{title}</div>
  </a>
);
