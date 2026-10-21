import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "../i18n";
import { Button } from "./Button";
import "./motion.css";
import "./screen.css";

export interface ErrorBoundaryProps {
  readonly children: ReactNode;
  /** Rendered instead of the default panel when the app crashed. */
  readonly fallback?: (reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

/**
 * Catches render errors so a crash does not leave the child staring at a
 * blank screen.
 *
 * Without this, a single throw inside any component unmounts the whole
 * tree and the tablet shows nothing at all. Here the child gets a friendly
 * screen with a button that retries.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // There is no error reporting service yet, so the details go to the
    // console where a developer can find them.
    console.error("Unhandled error in the app tree", error, info.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(this.reset);

    return (
      <main className="app-shell app-shell--center">
        <div className="panel crash" role="alert">
          <span className="crash__emoji" aria-hidden="true">
            🐻
          </span>
          <p className="crash__text">{i18n.t("error.crash")}</p>
          <Button
            label={i18n.t("error.crashRetry")}
            icon="🔁"
            onClick={this.reset}
          />
        </div>
      </main>
    );
  }
}
