# 3d-model-viewer

Proof of concept: add one script to a page, then use a `div` to show an interactive 3D model (.glb). Visitors drag to rotate and scroll or pinch to zoom.

```html
<script src="3d-model-viewer.js" defer></script>

<div data-glb="models/your-model.glb" data-alt="Describe the model" style="height:420px"></div>
```

That's the whole integration. The script loads Google's [model-viewer](https://modelviewer.dev/) and turns every `div[data-glb]` into a viewer.

This repo is code only. No model files are included; `models/` is gitignored.

## Try it locally

1. Put a .glb file at `models/example.glb`.
2. Serve the folder, e.g. `npx serve .`, and open the page. Opening `index.html` straight from disk may block the model from loading.

The page shows the model inline and inside a pop-up that's hidden on load, the same way Elementor pop-ups work.

## Options

All optional except `data-glb`.

| Attribute | Default | What it does |
| --- | --- | --- |
| `data-glb` | (required) | URL of the .glb file |
| `data-alt` | `3D model` | Accessible description |
| `data-auto-rotate` | `true` | Slow spin; set `false` to turn off |
| `data-rotation-speed` | `18deg` | Spin speed per second |
| `data-orbit` | `35deg 68deg 58%` | Starting angle (horizontal, vertical) and distance |
| `data-shadow` | `0.6` | Ground shadow strength, 0–2 |
| `data-poster` | none | Image shown until the model loads |
| `data-exposure` | model-viewer default | Brightness |

The div needs a height (inline style or CSS). If it has none, the script sets 400px.

## How it works

- **One script, no build step.** `3d-model-viewer.js` is a plain script (~4 KB). It adds model-viewer 4.4.0 from jsDelivr, then creates a `<model-viewer>` inside each `div[data-glb]`.
- **Pop-ups and page builders.** A MutationObserver picks up divs added after page load and changes to `data-glb`. Models use `loading="lazy"`, so a model inside a hidden pop-up downloads only when the pop-up opens.
- **Compressed models.** model-viewer decodes Draco-compressed .glb files automatically (the decoder loads from Google's CDN).
- **API.** `ModelViewerEmbed.refresh()` re-scans the page; `ModelViewerEmbed.render(el)` renders one element.

## Preparing models

CAD exports are often 20 MB+. Optimize before uploading with [gltf-transform](https://gltf-transform.dev/):

```sh
npx @gltf-transform/cli center input.glb centered.glb --pivot center
npx @gltf-transform/cli optimize centered.glb output.glb --compress draco --simplify true --texture-compress webp --instance false
```

On a real client model, this took the file from 21 MB to 757 KB and from 6,510 draw calls to 6.

`--instance false` matters: with instancing on, model-viewer framed the Draco-compressed model off-center.

## Path to a WordPress plugin

The plugin version is the same idea behind a shortcode:

```
[model_viewer src="/wp-content/uploads/3d-models/your-model.glb" alt="Describe the model"]
```

Things the plugin should handle that this proof of concept doesn't:

- Enqueue model-viewer only on pages that use the shortcode, as an ES module (`type="module"`).
- Exclude it from WP Rocket's "Delay JavaScript execution" (and similar optimizers), or it never runs.
- Allow `.glb` uploads in the Media Library (blocked by default); check the `glTF` file signature.
- Preload the library in the Elementor editor preview so models show while editing.
- Optionally bundle model-viewer and the Draco decoder to avoid third-party CDNs.

## License

MIT. model-viewer is Apache 2.0.
