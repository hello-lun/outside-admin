import 'reflect-metadata';


class Parent {
  public name!: string;
  public price!: number;
  public count = 1;

  constructor(name: string, price: number, count: number) {
    this.name = name;
    this.price = price;
    this.count = count;
  }

  public eat() {
    return this.fruit() + ':---->>>>' + this.total();
  }

  public fruit():string {
    return this.name;
  }

  public total(): number {
    return this.price * this.count;
  }
}

class Orange extends Parent {
  public name: string;
  constructor(name: string, price: number, count: number) {
    super(name, price, count);
    this.name = name + '8888';
  }

  public total(): number {
      return this.price * 0.5;
  }
}

const a = new Orange('苹果🍎', 12, 1);
console.log('a.eat();: ', a.eat());