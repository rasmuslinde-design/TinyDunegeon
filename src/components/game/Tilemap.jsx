// Tilemap renderer — correctly maps tile indices to the 12×11 spritesheet
import React, { useMemo } from "react";
import {
  TILE_SIZE,
  SCALE,
  RENDERED_TILE,
  SHEET_COLS,
} from "../../constants/tiles.js";
import { MAP_WIDTH, MAP_HEIGHT } from "../../constants/levels.js";

const TILEMAP_SRC = "/Tilemap/tilemap_packed.png";
// Sheet is 12 cols wide; total width = 12*16 = 192px
// At scale 3: rendered sheet width = 12*16*3 = 576px

// Tiles that should render with a coloured overlay
const OVERLAYS = {
  5: "rgba(255, 100,  20, 0.5)", // lava
  6: "rgba( 80, 200, 255, 0.3)", // ice
  7: "rgba(  0,   0,   0, 0.3)", // dark floor
  9: "rgba( 20, 100, 200, 0.4)", // water
};

// Tiles to skip rendering (use floor base only)
const FLOOR_TILES = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

// Get CSS background-position for a tile index
function tilePos(index, scale) {
  const col = index % SHEET_COLS;
  const row = Math.floor(index / SHEET_COLS);
  return `-${col * TILE_SIZE * scale}px -${row * TILE_SIZE * scale}px`;
}

// Pre-built inline style for a single tile
function makeTileStyle(index, scale) {
  const size = TILE_SIZE * scale;
  return {
    position: "absolute",
    width: size,
    height: size,
    backgroundImage: `url(${TILEMAP_SRC})`,
    backgroundPosition: tilePos(index, scale),
    backgroundSize: `${SHEET_COLS * TILE_SIZE * scale}px auto`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
  };
}

export default function Tilemap({ levelData }) {
  const { map, floorTile = 0 } = levelData;
  // Support variable-size maps (level 1 = 60×60, others = 20×15)
  const COLS = levelData.cols ?? MAP_WIDTH;
  const ROWS = levelData.rows ?? MAP_HEIGHT;

  const cells = useMemo(() => {
    const out = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tile = map[row]?.[col] ?? 0;
        const px = col * RENDERED_TILE;
        const py = row * RENDERED_TILE;
        out.push({ tile, px, py, key: `${row}-${col}` });
      }
    }
    return out;
  }, [map, COLS, ROWS]);

  const floorStyle = useMemo(
    () => ({ ...makeTileStyle(floorTile, SCALE), position: "absolute" }),
    [floorTile],
  );

  return (
    <div
      style={{
        position: "relative",
        width: COLS * RENDERED_TILE,
        height: ROWS * RENDERED_TILE,
      }}
    >
      {cells.map(({ tile, px, py, key }) => (
        <React.Fragment key={key}>
          {/* Always render floor base */}
          <div style={{ ...floorStyle, left: px, top: py }} />

          {/* Render the actual tile on top if it differs from floor */}
          {tile !== floorTile && (
            <div
              style={{
                ...makeTileStyle(tile, SCALE),
                position: "absolute",
                left: px,
                top: py,
              }}
            />
          )}

          {/* Colour tint overlay for special floor types */}
          {OVERLAYS[tile] && (
            <div
              style={{
                position: "absolute",
                left: px,
                top: py,
                width: RENDERED_TILE,
                height: RENDERED_TILE,
                background: OVERLAYS[tile],
                pointerEvents: "none",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
