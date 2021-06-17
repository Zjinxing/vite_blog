---
title: JS的继承
date: 2018-08-04 23:53:20
tags:
  - JavaScript
---

####  1、原型链继承

基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法，实现的本质是重写原型对象，代之以一个新类型的实例。 看一下下面的简单代码

```js
function Animal() {
  this.health = "good";
};
Animal.prototype.getHealth = function () {
  console.log(`The animal is in ${this.health} health`);
}

function Cat() {};
Cat.prototype = new Animal();
let cat = new Cat();
cat.health; // "good"
cat.getHealth(); // The animal is in good health
```

这里并没有给Cat添加任何属性和方法，但是修改了Cat的原型，使其指向Animal 的实例，因此Cat就继承了Animal的属性和方法。 在使用原型链继承时，如果原型中包含引用类型值，就会出现问题：

```js
function Animal() {
  this.skills = ["eat", "sleep", "sing"];
}
function Bird() {}
Bird.prototype = new Animal();
var eagle = new Bird();
eagle.skills.push("fly");
eagle.skills // "eat", "sleep", "sing", "fly"
var ostrich = new Bird();
ostrich.skills // "eat", "sleep", "sing", "fly"
```

Bird通过原型链继承了Animal，也拥有了一个skills属性，当通过Bird创建实例时，所有实例都会共享这一个skills属性，修改任何一个实例的skills属性都将会影响到其他实例，这显然不是我们期望的。

#### 2、构造函数继承

基本思想是在子类的构造函数中调用父类构造函数，如下：

```js
function Animal() {
  this.skills = \["eat", "sleep", "sing"\];
}

function Bird() {
  // 实现继承
  Animal.call(this);
}
var eagle = new Bird();
eagle.skills.push("fly");
eagle.skills // "eat", "sleep", "sing", "fly"

var ostrich = new Bird();
ostrich.skills // "eat", "sleep", "sing"
```

当我们通过子类Bird创建实例时，实际上是调用了父类Animal的constructor，因此每个Bird实例都会有了自己的skills属性。 另外构造函数的另一大优势是可以向父类构造函数传递参数：

```js
function Animal(class) {
  this.skills = ["eat", "sleep", "sing"];
  this.class = class;
}

function Bird() {
  // 实现继承
  Animal.call(this, "eagle");
}
var eagle = new Bird();
eagle.class // "eagle"
```

#### 3、组合继承

组合继承指的是将原型链和借用构造函数的技术组合的一块，从而发挥二者之长的一种继承模式，也是JavaScript中最常用的继承模式：

```js
function Animal(name) {
  this.skills = ["eat", "sleep", "sing"];
  this.name = name;
}

Animal.prototype.eat = function () {
  console.log(`I am ${this.name}, I am eating`);
}

function Bird(name, age) {
  // 继承属性
  Animal.call(this, name)
  this.age = age;
}
// 继承方法
Bird.prototype = new Animal();
// 将构造函数重新指向Bird
Bird.prototype.constructor = Bird;
Bird.prototype.sayAge = function () {
  console.log(this.age);
}
var bird1 = new Bird("pipi", 1);
var bird2 = new Bird("qiqi", 2);
bird1.skills.push("fly");
console.log(bird1.skills); // "eat", "sleep", "sing", "fly"
bird1.eat(); // I am pipi, I am eating
bird1.sayAge(); // 1

console.log(bird2.skills); // "eat", "sleep", "sing"
bird2.eat(); // I am qiqi, I am eating
bird2.sayAge(); // 2
```

#### 4、原型式继承

原型继承其本质是对一个已有对象的浅拷贝：

```js
function object(o) {
  function F(){};
  F.prototype = o;
  return new F();
}
var animal = {
  skills: ["eat", "sleep", "sing"],
  eat: function() {
    console.log("I am eating");
  }
}
var bird = object(animal);
bird.skills //"eat", "sleep", "sing"
bird.eat() // I am eating
```

object函数以对象o为模板，在函数内部定义一个空构造函数，让其原型对象指向o，返回一个构造函数的实例，这样就有了对象o的所有属性和方法 es5中新增一个函数Object.create()方法规范化了原型式继承

```js
var bird = Object.create(animal);
bird.skills // "eat", "sleep", "sing"
bird.eat() // I am eating
```

需要注意的是此方法实现继承不同实例之间包含的引用类型值会共享，就像原型链继承一样。

#### 5、寄生式继承

寄生式继承和原型式继承比较类似：

```js
function createObj(o) {
    var clone = object(o); // 通过调用函数创建一个对象
    clone.eat = function() { // 在此对象基础上添加方法或属性
        console.log("I am eating");
    }
    return clone; // 返回此对象
}
var animal = {
    skills: ["eat", "sleep", "sing"]
}
var bird = createObj(animal);
bird.eat() // I am eating
```

#### 6、寄生组合式继承

寄生组合式继承即通过借用构造函数继承属性，通过原型链方式继承方法：

```js
function inherit(subType, superType) {
  var prototype = object(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}
```

object其实就相当于Object.create()，因此还可以写成下面这样：
```js
function inherit(subType, superType) {
  var prototype = Object.create(superType.prototype); 
  prototype.constructor = subType;
  subType.prototype = prototype;
}
```

在函数内部首先以父类原型为模板创建了一个对象，然后给此对象添加constructor属性，使其指向subType，最后将次对象赋值给子对象subType的原型：

```js
function inherit(subType, superType) {
  var prototype = Object.create(superType.prototype); 
  prototype.constructor = subType;
  subType.prototype = prototype;
}

function Animal(name) {
  this.skills = ["eat", "sleep", "sing"];
  this.name = name;
}
Animal.prototype.eat = function () {
  console.log(`I am ${this.name}, I am eating`);
}
function Bird(name, age) {
  Animal.call(this, name);
  this.age = age;
}
inherit(Bird, Animal)
Bird.prototype.sayAge = function() {
  console.log(this.age);
}
let eagle = new Bird("pipi", 1);
console.log(eagle.skills) // "eat", "sleep", "sing"
eagle.eat(); //I am pipi, I am eating
eagle.sayAge() // 1
```

_注：以上参考与JavaScript高级程序设计（第3版）_