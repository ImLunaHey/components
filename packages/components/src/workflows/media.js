import { $, el, button, picker, message, download } from "./ui.js";
export function cropBounds(width, height, ratio, zoom = 1, x = 50, y = 50) {
  let w = width,
    h = height;
  if (w / h > ratio) w = h * ratio;
  else h = w / ratio;
  w /= zoom;
  h /= zoom;
  return {
    x: ((width - w) * x) / 100,
    y: ((height - h) * y) / 100,
    width: w,
    height: h,
  };
}
export function initMedia() {
  const assets = [],
    selected = new Set();
  let current = null,
    image = null,
    rotation = 0,
    ratio = "original",
    version = 0,
    replaceTarget = null,
    readBusy = false;
  const urls = new Set();
  const createUrl = (blob) => {
    const url = URL.createObjectURL(blob);
    urls.add(url);
    return url;
  };
  const revoke = (url) => {
    if (urls.has(url)) {
      URL.revokeObjectURL(url);
      urls.delete(url);
    }
  };
  for (const [name, color, alt] of [
    ["Mountain landscape", "#89b9ed", "Blue mountain landscape"],
    ["Forest banner", "#8ed6a0", "Green forest illustration"],
    ["Evening cover", "#b9a2e8", "Purple evening landscape"],
  ]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#202020"/><circle cx="920" cy="190" r="80" fill="${color}"/><path d="M0 800V650L300 200 600 650 850 350 1200 800Z" fill="${color}"/><path d="M0 800V730L280 470 500 800 900 500 1200 800Z" fill="#394450"/></svg>`;
    assets.push({
      id: crypto.randomUUID(),
      name: name + ".svg",
      alt,
      type: "image/svg+xml",
      size: svg.length,
      url: createUrl(new Blob([svg], { type: "image/svg+xml" })),
      width: 1200,
      height: 800,
    });
  }
  let type = "all";
  picker(
    $("media-type-control"),
    "Media type",
    [
      ["all", "All images"],
      ["image/png", "PNG"],
      ["image/jpeg", "JPEG"],
      ["image/webp", "WebP"],
      ["image/svg+xml", "SVG"],
    ],
    "all",
    (v) => {
      type = v;
      render();
    },
  );
  const ratioPicker = picker(
    $("editor-ratio-control"),
    "Crop aspect ratio",
    [
      ["original", "Original ratio"],
      ["1", "Square · 1:1"],
      ["1.7777777778", "Landscape · 16:9"],
      ["0.75", "Portrait · 3:4"],
    ],
    "original",
    (v) => {
      ratio = v;
      draw();
    },
  );
  function render() {
    const q = $("media-search").value.toLowerCase();
    const matches = assets.filter(
      (a) =>
        (a.name + " " + a.alt).toLowerCase().includes(q) &&
        (type === "all" || a.type === type),
    );
    $("media-grid").replaceChildren();
    for (const asset of matches) {
      const card = el("div", undefined, "media-card");
      const img = el("img");
      img.src = asset.url;
      img.alt = asset.alt;
      const inspect = button("", () => inspectAsset(asset), "media-preview");
      inspect.append(img);
      inspect.setAttribute("aria-label", "Inspect " + asset.name);
      const choice = el("input");
      choice.type = "checkbox";
      choice.checked = selected.has(asset.id);
      choice.setAttribute("aria-label", "Select " + asset.name);
      choice.onchange = () => {
        choice.checked ? selected.add(asset.id) : selected.delete(asset.id);
        render();
      };
      const caption = el("label", undefined, "media-caption");
      caption.append(choice, el("span", asset.name));
      card.append(inspect, caption);
      $("media-grid").append(card);
    }
    if (!matches.length)
      $("media-grid").append(el("p", "No matching images.", "muted"));
    $("media-use").disabled = $("media-delete").disabled = !selected.size;
    $("media-use").textContent =
      `Use selected${selected.size ? " (" + selected.size + ")" : ""}`;
  }
  function inspectAsset(asset) {
    current = asset;
    const host = $("media-inspector");
    host.replaceChildren(
      el("strong", asset.name),
      el(
        "p",
        `${asset.width} × ${asset.height} · ${(asset.size / 1024).toFixed(1)} KB`,
        "small muted",
      ),
      el("p", asset.alt || "No alt text", "small"),
    );
    host.append(
      button("Edit image", () => {
        openEditor(asset);
        window.dispatchEvent(
          new CustomEvent("demo:navigate", { detail: "image-editor" }),
        );
        $("image-editor").scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      }),
      button("Replace image", () => {
        replaceTarget = asset.id;
        $("media-replace-file").click();
      }),
    );
    openEditor(asset);
  }
  async function decode(url) {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(Error("This image could not be decoded."));
      img.src = url;
    });
  }
  function reset() {
    ratio = "original";
    ratioPicker.native.value = "original";
    ratioPicker.native.dispatchEvent(new Event("change"));
    rotation = 0;
    $("editor-angle").textContent = "0°";
    for (const id of ["editor-x", "editor-y"]) $(id).value = "50";
    $("editor-zoom").value = "1";
    $("editor-width").value = String(Math.min(800, image?.naturalWidth || 800));
    $("editor-alt").value = current?.alt || "";
    draw();
  }
  async function openEditor(asset) {
    const token = ++version;
    image = null;
    $("editor-save").disabled = $("editor-download").disabled = true;
    message("editor-status", "Loading " + asset.name + "…");
    try {
      const decoded = await decode(asset.url);
      if (token !== version) return;
      image = decoded;
      reset();
    } catch (error) {
      if (token === version) message("editor-status", error.message, true);
    }
  }
  function draw() {
    if (!image) return false;
    $("editor-save").disabled = $("editor-download").disabled = true;
    const width = Number($("editor-width").value);
    if (!Number.isInteger(width) || width < 64 || width > 2048) {
      message("editor-status", "Output width must be 64–2048 pixels.", true);
      $("editor-save").disabled = $("editor-download").disabled = true;
      return false;
    }
    const turned = rotation % 180 !== 0,
      sw = turned ? image.naturalHeight : image.naturalWidth,
      sh = turned ? image.naturalWidth : image.naturalHeight;
    const ar = ratio === "original" ? sw / sh : Number(ratio);
    const height = Math.round(width / ar);
    if (height > 4096) {
      message(
        "editor-status",
        "Choose a shorter aspect ratio or smaller width.",
        true,
      );
      return false;
    }
    const rotated = document.createElement("canvas");
    rotated.width = sw;
    rotated.height = sh;
    const rc = rotated.getContext("2d");
    if (!rc) return false;
    rc.translate(sw / 2, sh / 2);
    rc.rotate((rotation * Math.PI) / 180);
    rc.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    const crop = cropBounds(
      sw,
      sh,
      ar,
      Number($("editor-zoom").value),
      Number($("editor-x").value),
      Number($("editor-y").value),
    );
    const canvas = $("editor-canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      rotated,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      width,
      height,
    );
    $("editor-save").disabled = $("editor-download").disabled = false;
    message(
      "editor-status",
      `${current?.name || "Image"} · output ${width} × ${height} pixels`,
    );
    return true;
  }
  async function exportImage(save) {
    if (!draw()) return;
    const asset = current,
      alt = $("editor-alt").value,
      canvas = $("editor-canvas"),
      width = canvas.width,
      height = canvas.height;
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) {
      message("editor-status", "Could not create the PNG.", true);
      return;
    }
    if (save) {
      const copy = {
        id: crypto.randomUUID(),
        name: asset.name.replace(/\.[^.]+$/, "") + "-edited.png",
        type: "image/png",
        alt,
        size: blob.size,
        width,
        height,
        url: createUrl(blob),
      };
      assets.unshift(copy);
      render();
      message("editor-status", "Saved an edited copy to the media library.");
    } else download(blob, "edited-image.png", "image/png");
  }
  for (const id of ["editor-zoom", "editor-x", "editor-y", "editor-width"])
    $(id).oninput = draw;
  $("editor-rotate").onclick = () => {
    rotation = (rotation + 90) % 360;
    $("editor-angle").textContent = rotation + "°";
    draw();
  };
  $("editor-reset").onclick = reset;
  $("editor-form").onsubmit = (e) => {
    e.preventDefault();
    exportImage(true);
  };
  $("editor-download").onclick = () => exportImage(false);
  async function addFiles(files, replacing) {
    if (readBusy) {
      message(
        "media-status",
        "Wait for the current files to finish loading.",
        true,
      );
      return;
    }
    readBusy = true;
    let count = 0,
      errors = [];
    try {
      for (const file of files) {
        if (
          !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
            file.type,
          ) ||
          file.size > 10 * 1024 * 1024
        ) {
          errors.push(file.name + ": use PNG, JPEG, WebP or GIF under 10 MB");
          continue;
        }
        const url = createUrl(file);
        try {
          const img = await decode(url);
          if (img.naturalWidth * img.naturalHeight > 25000000)
            throw Error("Image exceeds 25 megapixels");
          const asset = {
            id: crypto.randomUUID(),
            name: file.name,
            alt: "",
            type: file.type,
            size: file.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
            url,
          };
          const index = assets.findIndex((a) => a.id === replacing);
          if (index >= 0) {
            const old = assets[index];
            asset.id = old.id;
            assets[index] = asset;
            revoke(old.url);
            inspectAsset(asset);
          } else assets.unshift(asset);
          count++;
        } catch (error) {
          revoke(url);
          errors.push(file.name + ": " + error.message);
        }
      }
      render();
      message(
        "media-status",
        `${count} image${count === 1 ? "" : "s"} added. ${errors.join("; ")}`,
        errors.length > 0,
      );
    } finally {
      readBusy = false;
    }
  }
  $("media-add").onclick = () => $("media-files").click();
  $("media-files").onchange = (e) => {
    addFiles([...e.target.files]);
    e.target.value = "";
  };
  $("media-replace-file").onchange = (e) => {
    addFiles([...e.target.files], replaceTarget);
    e.target.value = "";
  };
  $("media-search").oninput = render;
  $("media-use").onclick = () =>
    message(
      "media-status",
      "Selected: " +
        assets
          .filter((a) => selected.has(a.id))
          .map((a) => a.name)
          .join(", "),
    );
  $("media-delete").onclick = () => {
    for (let i = assets.length - 1; i >= 0; i--)
      if (selected.has(assets[i].id)) {
        revoke(assets[i].url);
        assets.splice(i, 1);
      }
    selected.clear();
    if (!assets.some((a) => a.id === current?.id)) {
      current = null;
      image = null;
      version++;
      $("media-inspector").replaceChildren(
        el("p", "Choose an image to inspect."),
      );
      $("editor-save").disabled = $("editor-download").disabled = true;
      const c = $("editor-canvas");
      c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
      message("editor-status", "Select an image from the library.");
    }
    render();
    message("media-status", "Selected images deleted.");
  };
  render();
  inspectAsset(assets[0]);
  window.addEventListener(
    "pagehide",
    () => {
      version++;
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    },
    { once: true },
  );
}
