import React from "react";
export const SnoozeLink = ({
  title,
  onClick
}: {
  title: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}) => (
  <a href="#" className="dib pa2 link avenir" onClick={onClick}>
    <div style={{ cursor: "pointer" }}>{title}</div>
  </a>
);
