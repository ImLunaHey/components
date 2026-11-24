import { mountFileAttachment } from "../file-attachment.js";
import { $, el, button, input, message } from "./ui.js";
export function initBoard() {
  const states = ["Todo", "In progress", "Done"];
  let dragged = null,
    tasks = [
      { id: "a", title: "Add storage alerts", state: 0 },
      { id: "b", title: "Review catalogue images", state: 0 },
      { id: "c", title: "Tune dashboard refresh", state: 1 },
      { id: "d", title: "Ship component styles", state: 2 },
    ];
  function move(task, delta, vertical = false) {
    if (vertical) {
      const siblings = tasks.filter((t) => t.state === task.state),
        i = siblings.indexOf(task),
        other = siblings[i + delta];
      if (!other) return;
      const a = tasks.indexOf(task),
        b = tasks.indexOf(other);
      [tasks[a], tasks[b]] = [tasks[b], tasks[a]];
    } else task.state = Math.max(0, Math.min(2, task.state + delta));
    render(task.id);
    message("board-status", `${task.title} · ${states[task.state]}`);
  }
  function render(focus) {
    $("board-columns").replaceChildren();
    states.forEach((state, index) => {
      const column = el("section", undefined, "board-column"),
        items = tasks.filter((t) => t.state === index);
      column.setAttribute("aria-label", state);
      column.append(el("h4", `${state} · ${items.length}`));
      column.ondragover = (e) => e.preventDefault();
      column.ondrop = (e) => {
        e.preventDefault();
        const task = tasks.find((t) => t.id === dragged);
        if (!task) return;
        task.state = index;
        dragged = null;
        render(task.id);
        message("board-status", task.title + " moved to " + state);
      };
      for (const task of items) {
        const card = el("article", undefined, "board-card");
        card.tabIndex = 0;
        card.draggable = true;
        card.dataset.task = task.id;
        card.setAttribute("aria-label", task.title + " in " + state);
        card.ondragstart = (e) => {
          dragged = task.id;
          e.dataTransfer?.setData("text/plain", task.id);
        };
        card.ondragend = () => (dragged = null);
        card.ondrop = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const moving = tasks.find((t) => t.id === dragged);
          if (!moving || moving === task) return;
          tasks = tasks.filter((t) => t !== moving);
          moving.state = index;
          tasks.splice(tasks.indexOf(task), 0, moving);
          dragged = null;
          render(moving.id);
          message("board-status", moving.title + " reordered in " + state);
        };
        card.onkeydown = (e) => {
          if (!e.altKey) return;
          const directions = {
            ArrowLeft: [-1, false],
            ArrowRight: [1, false],
            ArrowUp: [-1, true],
            ArrowDown: [1, true],
          };
          if (directions[e.key]) {
            e.preventDefault();
            move(task, ...directions[e.key]);
          }
        };
        card.append(el("p", task.title));
        const controls = el("div", undefined, "row");
        for (const [label, delta, vertical] of [
          ["←", -1, false],
          ["→", 1, false],
          ["↑", -1, true],
          ["↓", 1, true],
        ]) {
          const b = button(
            label,
            () => move(task, delta, vertical),
            "button small-button ghost",
          );
          b.setAttribute(
            "aria-label",
            `${vertical ? "Reorder" : "Move"} ${task.title} ${label}`,
          );
          b.disabled = vertical
            ? items.indexOf(task) + delta < 0 ||
              items.indexOf(task) + delta >= items.length
            : index + delta < 0 || index + delta > 2;
          controls.append(b);
        }
        card.append(controls);
        column.append(card);
      }
      if (!items.length)
        column.append(el("p", "Drop a task here.", "muted small"));
      $("board-columns").append(column);
    });
    if (focus)
      $("board-columns").querySelector(`[data-task="${focus}"]`)?.focus();
  }
  $("board-add").onsubmit = (e) => {
    e.preventDefault();
    const title = $("board-title").value.trim();
    if (!title) {
      $("board-title").setCustomValidity("Enter a task title.");
      $("board-title").reportValidity();
      return;
    }
    const task = { id: crypto.randomUUID(), title, state: 0 };
    tasks.push(task);
    $("board-title").value = "";
    render(task.id);
    message("board-status", "Task added to Todo.");
  };
  $("board-title").oninput = () => $("board-title").setCustomValidity("");
  render();
}
export function initComments() {
  const attachmentField = mountFileAttachment($("comment-attachment-field"), { id: "comment-file" });
  let comments = [
      {
        id: "seed",
        author: "Alex",
        text: "Can we check the storage warning before release?",
        likes: false,
        resolved: false,
        replies: [],
        attachment: null,
      },
    ],
    urls = new Set();
  function textBody(text) {
    const p = el("p", undefined, "comment-text");
    const parts = text.split(/(@(?:Luna|Alex|Sam|Ella)\b)/g);
    for (const part of parts)
      p.append(
        part.startsWith("@") ? el("mark", part) : document.createTextNode(part),
      );
    return p;
  }
  function render() {
    const list = $("comment-list");
    list.replaceChildren();
    for (const c of comments) {
      const card = el("article", undefined, "comment-card");
      card.append(
        el("strong", c.author + (c.resolved ? " · Resolved" : "")),
        textBody(c.text),
      );
      if (c.attachment) {
        const a = el("a", c.attachment.name, "attachment-link");
        a.href = c.attachment.url;
        a.download = c.attachment.name;
        card.append(a);
        if (c.attachment.image) {
          const img = el("img", undefined, "comment-attachment");
          img.src = c.attachment.url;
          img.alt = "Attached " + c.attachment.name;
          card.append(img);
        }
      }
      const actions = el("div", undefined, "row");
      const like = button(c.likes ? "♥ 1" : "♡ React", () => {
        c.likes = !c.likes;
        render();
      });
      like.setAttribute("aria-pressed", String(c.likes));
      actions.append(
        like,
        button(c.resolved ? "Reopen" : "Resolve", () => {
          c.resolved = !c.resolved;
          render();
        }),
      );
      if (c.author === "You")
        actions.append(
          button("Edit", () => {
            const area = el("textarea");
            area.value = c.text;
            area.maxLength = 2000;
            area.setAttribute("aria-label", "Edit comment");
            const edit = el("form", undefined, "stack");
            const save = el("button", "Save edit", "button primary");
            save.type = "submit";
            edit.append(area, save, button("Cancel", render));
            card.replaceChildren(edit);
            edit.onsubmit = (e) => {
              e.preventDefault();
              if (!area.value.trim()) {
                area.setCustomValidity("Enter a comment.");
                area.reportValidity();
                return;
              }
              c.text = area.value.trim();
              render();
            };
            area.oninput = () => area.setCustomValidity("");
            area.focus();
          }),
        );
      card.append(actions);
      for (const reply of c.replies) {
        const row = el("div", undefined, "comment-reply");
        row.append(el("strong", "You"), textBody(reply));
        card.append(row);
      }
      const form = el("form", undefined, "workflow-toolbar"),
        reply = input("Reply to " + c.author);
      reply.placeholder = "Reply…";
      reply.required = true;
      reply.maxLength = 2000;
      const submit = el("button", "Reply", "button small-button");
      submit.type = "submit";
      form.append(reply, submit);
      form.onsubmit = (e) => {
        e.preventDefault();
        if (!reply.value.trim()) return;
        c.replies.push(reply.value.trim());
        render();
        message("comment-status", "Reply added locally.");
      };
      card.append(form);
      list.append(card);
    }
  }
  $("comment-text").oninput = () => {
    const area = $("comment-text");
    area.setCustomValidity("");
    const query = area.value
      .slice(0, area.selectionStart)
      .match(/@([\w]*)$/)?.[1];
    $("comment-mentions").hidden = query === undefined;
    $("comment-mentions").replaceChildren();
    if (query !== undefined)
      for (const name of ["Luna", "Alex", "Sam", "Ella"].filter((n) =>
        n.toLowerCase().startsWith(query.toLowerCase()),
      )) {
        $("comment-mentions").append(
          button("@" + name, () => {
            const pos = area.selectionStart,
              start = pos - query.length - 1;
            area.setRangeText("@" + name + " ", start, pos, "end");
            $("comment-mentions").hidden = true;
            area.focus();
          }),
        );
      }
  };
  $("comment-form").onsubmit = (e) => {
    e.preventDefault();
    const area = $("comment-text"),
      text = area.value.trim(),
      file = $("comment-file").files[0];
    if (!text) {
      area.setCustomValidity("Enter a comment.");
      area.reportValidity();
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      message("comment-status", "Attachments must be under 5 MB.", true);
      return;
    }
    let attachment = null;
    if (file) {
      const url = URL.createObjectURL(file);
      urls.add(url);
      attachment = {
        name: file.name,
        url,
        image: file.type.startsWith("image/"),
      };
    }
    comments.push({
      id: crypto.randomUUID(),
      author: "You",
      text,
      likes: false,
      resolved: false,
      replies: [],
      attachment,
    });
    area.value = "";
    attachmentField.reset();
    $("comment-mentions").hidden = true;
    render();
    message("comment-status", "Comment posted in this preview.");
  };
  render();
  window.addEventListener(
    "pagehide",
    () => urls.forEach((url) => URL.revokeObjectURL(url)),
    { once: true },
  );
}
