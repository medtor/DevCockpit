export class PendingOperations {
  #count = 0;
  #waiters = [];
  #closed = false;
  #tail = Promise.resolve();

  close() {
    this.#closed = true;
  }

  open() {
    this.#closed = false;
  }

  begin() {
    if (this.#closed) return null;
    this.#count += 1;
    let finished = false;
    return () => {
      if (finished) return;
      finished = true;
      this.#count -= 1;
      if (this.#count === 0) {
        const waiters = this.#waiters;
        this.#waiters = [];
        waiters.forEach((resolve) => resolve());
      }
    };
  }

  run(operation) {
    const result = this.#tail.catch(() => undefined).then(operation);
    this.#tail = result.then(() => undefined, () => undefined);
    return result;
  }

  wait() {
    if (this.#count === 0) return Promise.resolve();
    return new Promise((resolve) => this.#waiters.push(resolve)).then(() => this.wait());
  }
}
