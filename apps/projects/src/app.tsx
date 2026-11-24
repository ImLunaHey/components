import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Frame } from "../../../src/demos/frame";
import { layout } from "../../../src/demos/layout";
import { Button } from "@imlunahey/components/button";
import { Input } from "@imlunahey/components/input";
import { Textarea } from "@imlunahey/components/textarea";
import { Panel } from "@imlunahey/components/panel";
import { Badge } from "@imlunahey/components/badge";
import { Select } from "@imlunahey/components/select";
import { FileUpload } from "@imlunahey/components/file-upload";
import { DataTable } from "@imlunahey/components/data-table";
const items = [
  { id: "board", label: "Board" },
  { id: "projects", label: "Projects" },
  { id: "discussion", label: "Discussion" },
];
const initial = [
  { id: 1, title: "Add storage alerts", status: "Todo" },
  { id: 2, title: "Review catalogue images", status: "In progress" },
  { id: 3, title: "Tune dashboard refresh", status: "Done" },
];
export function App({ view }: { view: string }) {
  const [tasks, setTasks] = useState(() => {
    try {
      return (
        (JSON.parse(localStorage.getItem("orbit-react-tasks") ?? "null") as typeof initial) ??
        initial
      );
    } catch {
      return initial;
    }
  });
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState([
    {
      id: 1,
      text: "Can we review the storage alerts before release?",
      fileName: "",
      resolved: false,
    },
  ]);
  const [uploadKey, setUploadKey] = useState(0);
  function update(next: typeof initial) {
    setTasks(next);
    localStorage.setItem("orbit-react-tasks", JSON.stringify(next));
  }
  function move(id: number, status: string) {
    update(tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  }
  return (
    <Frame name="Orbit" view={view} items={items}>
      {view === "discussion" ? (
        <Panel title="Release discussion">
          <ul {...stylex.props(layout.list)}>
            {comments.map((c) => (
              <li key={c.id} {...stylex.props(layout.card)}>
                <div {...stylex.props(layout.between)}>
                  <strong>Luna H.</strong>
                  <Badge tone={c.resolved ? "success" : "info"}>
                    {c.resolved ? "Resolved" : "Open"}
                  </Badge>
                </div>
                <p>{c.text}</p>
                {c.fileName && (
                  <span {...stylex.props(layout.muted)}>Attachment: {c.fileName}</span>
                )}
                <Button
                  size="small"
                  onClick={() =>
                    setComments(
                      comments.map((item) =>
                        item.id === c.id ? { ...item, resolved: !item.resolved } : item,
                      ),
                    )
                  }
                >
                  {c.resolved ? "Reopen" : "Resolve"}
                </Button>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setComments([
                ...comments,
                {
                  id: Date.now(),
                  text: comment,
                  fileName: files.map((f) => f.name).join(", "),
                  resolved: false,
                },
              ]);
              setComment("");
              setFiles([]);
              setUploadKey(uploadKey + 1);
            }}
            {...stylex.props(layout.stack)}
          >
            <Textarea
              label="Comment"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <FileUpload key={uploadKey} onFilesChange={setFiles} />
            <Button type="submit" variant="primary">
              Post comment
            </Button>
          </form>
        </Panel>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update([...tasks, { id: Date.now(), title, status: "Todo" }]);
              setTitle("");
            }}
            {...stylex.props(layout.row)}
          >
            <Input
              label="Task title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button type="submit" variant="primary">
              New task
            </Button>
            <Input
              label="Filter tasks"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          {view === "projects" ? (
            <DataTable
              label="Tasks"
              data={tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))}
              columns={[
                { accessorKey: "title", header: "Task" },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: (info) => (
                    <Select
                      label="Move task"
                      value={info.row.original.status}
                      onValueChange={(value) => move(info.row.original.id, value)}
                      options={["Todo", "In progress", "Done"].map((value) => ({
                        value,
                        label: value,
                      }))}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <div {...stylex.props(layout.three)}>
              {["Todo", "In progress", "Done"].map((status) => (
                <section
                  key={status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = Number(e.dataTransfer.getData("text/plain"));
                    if (tasks.some((t) => t.id === id)) move(id, status);
                  }}
                >
                  <Panel
                    title={status}
                    actions={<Badge>{tasks.filter((t) => t.status === status).length}</Badge>}
                  >
                    <div {...stylex.props(layout.board)}>
                      {tasks
                        .filter(
                          (t) =>
                            t.status === status &&
                            t.title.toLowerCase().includes(query.toLowerCase()),
                        )
                        .map((task) => (
                          <article
                            key={task.id}
                            draggable
                            onDragStart={(e) =>
                              e.dataTransfer.setData("text/plain", String(task.id))
                            }
                            {...stylex.props(layout.card)}
                          >
                            <strong>{task.title}</strong>
                            <span {...stylex.props(layout.muted)}>ORB-{task.id}</span>
                            <Select
                              label={"Move " + task.title}
                              value={task.status}
                              onValueChange={(value) => move(task.id, value)}
                              options={["Todo", "In progress", "Done"].map((value) => ({
                                value,
                                label: value,
                              }))}
                            />
                          </article>
                        ))}
                    </div>
                  </Panel>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </Frame>
  );
}
