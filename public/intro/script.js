let canInteract = false;
let isLoading = false;
let keysPressed = {};

// Funktsioon objektide loomiseks
function createObj(model, x, y, z, scale, rot, parent) {
  const el = document.createElement("a-entity");
  el.setAttribute("gltf-model", model);
  el.setAttribute("position", `${x} ${y} ${z}`);
  el.setAttribute("scale", `${scale} ${scale} ${scale}`);
  el.setAttribute("rotation", `0 ${rot} 0`);
  parent.appendChild(el);
}

// Pinkide loomine
function createBench(x, z, rot, parent) {
  const bench = document.createElement("a-entity");
  bench.setAttribute("position", `${x} 0 ${z}`);
  bench.setAttribute("rotation", `0 ${rot} 0`);
  const seat = document.createElement("a-box");
  seat.setAttribute("width", "3");
  seat.setAttribute("height", "0.1");
  seat.setAttribute("depth", "1");
  seat.setAttribute("color", "#4a2c10");
  seat.setAttribute("position", "0 0.5 0");
  const back = document.createElement("a-box");
  back.setAttribute("width", "3");
  back.setAttribute("height", "0.6");
  back.setAttribute("depth", "0.1");
  back.setAttribute("color", "#3d240d");
  back.setAttribute("position", "0 0.9 -0.45");
  for (let i of [-1.2, 1.2]) {
    const leg = document.createElement("a-box");
    leg.setAttribute("width", "0.15");
    leg.setAttribute("height", "0.5");
    leg.setAttribute("depth", "0.8");
    leg.setAttribute("color", "#111");
    leg.setAttribute("position", `${i} 0.25 0`);
    bench.appendChild(leg);
  }
  bench.appendChild(seat);
  bench.appendChild(back);
  parent.appendChild(bench);
}

// Tähtede genereerimine
function generateStars(num, parent) {
  for (let i = 0; i < num; i++) {
    const star = document.createElement("a-sphere");
    let x = (Math.random() - 0.5) * 1500;
    let y = Math.random() * 500 + 100;
    let z = (Math.random() - 0.5) * 1500;
    star.setAttribute("position", `${x} ${y} ${z}`);
    star.setAttribute("radius", Math.random() * 0.8 + 0.3);
    star.setAttribute("material", {
      color: "#fff",
      shader: "flat",
      emissive: "#fff",
      emissiveIntensity: 5,
    });
    parent.appendChild(star);
  }
}

// Maailma loomine kui leht laeb
window.onload = () => {
  const container = document.getElementById("world-objects");
  const starCon = document.getElementById("star-field");
  const cam = document.getElementById("main-cam");
  const steps = document.getElementById("player-steps");

  // 1. GENEREERI TÄHED
  if (starCon) generateStars(1000, starCon);

  // 2. LOO MAJAD JA PUUD
  if (container) {
    for (let z = 120; z > -55; z -= 25) {
      createObj("#house1-m", -18, 0, z, 7, 90, container);
      createObj("#tree-m", -10, 4, z - 10, 4, 0, container);
      createBench(-7, z + 5, 90, container);
      createObj("#house2-m", 22, 6, z, 2, -90, container);
      createObj("#tree-m", 12, 13, z + 10, 10, 0, container);
    }

    for (let i = 0; i < 70; i++) {
      let randX = (Math.random() - 0.5) * 400;
      let randZ = (Math.random() - 0.5) * 400;
      if (Math.abs(randX) < 20) randX += randX > 0 ? 40 : -40;
      createObj(
        "#tree-m",
        randX,
        4,
        randZ,
        1.5 + Math.random(),
        Math.random() * 360,
        container,
      );
    }
  }

  // 4. LIIKUMISE JA DISTANTSI KONTROLL
  const worldPos = new THREE.Vector3();
  setInterval(() => {
    if (isLoading) return;

    cam.object3D.getWorldPosition(worldPos);
    const dist = Math.sqrt(worldPos.x ** 2 + (worldPos.z + 60) ** 2);

    canInteract = dist < 20;
    document.getElementById("ui").style.display = canInteract
      ? "block"
      : "none";

    // Kontrolli sammuheli
    const isMoving =
      keysPressed["w"] ||
      keysPressed["a"] ||
      keysPressed["s"] ||
      keysPressed["d"];
    if (isMoving) {
      steps.components.sound.playSound();
    } else {
      steps.components.sound.stopSound();
    }
  }, 100);

  // Klahvide jälgimine
  window.addEventListener("keydown", (e) => {
    keysPressed[e.key.toLowerCase()] = true;

    // Lossi sisenemine
    if (e.key.toLowerCase() === "e" && canInteract && !isLoading) {
      enterCastle();
    }
  });

  window.addEventListener("keyup", (e) => {
    keysPressed[e.key.toLowerCase()] = false;
  });

  document.body.addEventListener("click", () => {
    if (!document.pointerLockElement) document.body.requestPointerLock();
  });
};

function enterCastle() {
  isLoading = true;

  // 1. Peida interaktsiooni UI
  document.getElementById("ui").style.display = "none";

  // 2. Aktiveeri must laadimisekraan
  document.getElementById("loading-screen").classList.add("active");

  // 3. PEATA KÕIK HELID
  // Peatame sammud
  const steps = document.getElementById("player-steps");
  if (steps && steps.components.sound) {
    steps.components.sound.stopSound();
  }

  // Peatame tuule/taustaheli (otsime üles entity, millel on sound komponent)
  const allSounds = document.querySelectorAll("[sound]");
  allSounds.forEach((el) => {
    if (el.components.sound) {
      el.components.sound.stopSound();
    }
  });

  // 4. Oota ja tee "sisenemine"
  setTimeout(() => {
    // Teavita parent app'i (TinyDunegeon), et intro on läbi.
    // Parent kuulab seda ja avab TitleScreen'i.
    try {
      window.parent?.postMessage(
        { type: "TINYDUNGEON_INTRO_DONE" },
        window.location.origin,
      );
    } catch (e) {
      // Kui postMessage ei õnnestu (nt erinev origin), siis fallback.
      // eslint-disable-next-line no-alert
      alert("Oled nüüd lossi vaikuses...");
    }
  }, 2500);
}
