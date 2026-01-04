import type { ParentProps } from "solid-js";
import { A } from "@solidjs/router";

export default function App(props: ParentProps) {
  return (
    <>
      <nav>
        <A href="/">Home</A>
        <A href="/about">About</A>
      </nav>
      <main>{props.children}</main>
    </>
  );
}
