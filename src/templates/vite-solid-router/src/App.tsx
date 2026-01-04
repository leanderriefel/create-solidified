import type { ParentProps } from "solid-js";
export default function App(props: ParentProps) {
  return (
    <>
      <main>{props.children}</main>
    </>
  );
}
