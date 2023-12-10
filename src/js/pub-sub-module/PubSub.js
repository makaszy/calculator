class PubSub {
  constructor() {
    this.subscribers = [];
  }

  subscribe(subscriber) {
    if (typeof subscriber !== 'function') {
      throw new Error(`${typeof subscriber} is not a valid argument, provide a function instead`);
    }
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    if (typeof subscriber !== 'function') {
      throw new Error(`${typeof subscriber} is not a valid argument, provide a function instead`);
    }
    this.subscribers = this.subscribers.filter((sub) => sub !== subscriber);
  }

  publish(payload) {
    this.subscribers.forEach((subscriber) => subscriber(payload));
  }
}

export default PubSub;
