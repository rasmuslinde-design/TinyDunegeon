// Sprite — renders a single tile from tilemap_packed.png at (row, col)
import React from "react";
import { TILE_SIZE, SCALE, SHEET_COLS } from "../../constants/tiles.js";

const TILEMAP_SRC = "/Tilemap/tilemap_packed.png";

export default function Sprite({
  row,
  col,
  x,
  y,
  scale = SCALE,
  flip = false,
  style = {},
  onClick,
}) {
  const size = TILE_SIZE * scale;
  const bgSize = `${SHEET_COLS * TILE_SIZE * scale}px auto`;
  const bgPos = `-${col * TILE_SIZE * scale}px -${row * TILE_SIZE * scale}px`;

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundImage: `url(${TILEMAP_SRC})`,
        backgroundPosition: bgPos,
        backgroundSize: bgSize,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    />
  );
}

// TileSprite — renders by flat index (index = row*12 + col)
export function TileSprite({ index, x, y, scale = SCALE, style = {} }) {
  const col = index % SHEET_COLS;
  const row = Math.floor(index / SHEET_COLS);
  return <Sprite row={row} col={col} x={x} y={y} scale={scale} style={style} />;
}
