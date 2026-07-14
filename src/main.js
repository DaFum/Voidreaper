import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/hud.css";
import "./styles/screens.css";
import "./styles/hangar.css";
import "./styles/map.css";
import "./styles/codex.css";
import "./styles/ship-assembly.css";
import "./styles/ship-assembly-mobile.css";
import "./styles/tutorial.css";
import { bootstrap } from "./app/bootstrap.js";

bootstrap().catch(error => {
  console.error("[startup] Voidreaper failed to initialize", error);
  document.body.innerHTML = `<main class="service-screen"><h1>START FEHLGESCHLAGEN</h1><p>Voidreaper konnte nicht initialisiert werden. Bitte lade die Seite neu.</p></main>`;
});
