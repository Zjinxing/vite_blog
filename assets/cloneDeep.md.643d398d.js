import{o as n,c as s,a}from"./app.5d547dc4.js";const t='{"title":"实现一个深拷贝","description":"","frontmatter":{"title":"实现一个深拷贝","date":"2021-07-01","tags":["JavaScript"],"describe":"我们在开发中经常会遇到需要使用深拷贝的场景，简单些的可能就直接用 JSON.parse(JSON.stringify(target)) 来实现，复杂点的可能会使用 lodash 的 cloneDeep，很少会自己去实现一个深拷贝。虽然知道使用递归去实现，但试过之后发现还是有许多需要注意的地方的。"},"headers":[{"level":2,"title":"实现一个深拷贝","slug":"实现一个深拷贝"},{"level":3,"title":"借助 JSON 实现","slug":"借助-json-实现"},{"level":3,"title":"递归实现简单版本","slug":"递归实现简单版本"},{"level":3,"title":"解决循环引用的版本","slug":"解决循环引用的版本"},{"level":3,"title":"加入其它类型对象的改进版","slug":"加入其它类型对象的改进版"},{"level":3,"title":"最后","slug":"最后"}],"relativePath":"cloneDeep.md","lastUpdated":1625096202012}',p={},o=a('<h2 id="实现一个深拷贝"><a class="header-anchor" href="#实现一个深拷贝" aria-hidden="true">#</a> 实现一个深拷贝</h2><blockquote><p>我们在开发中经常会遇到需要使用深拷贝的场景，简单些的可能就直接用 JSON.parse(JSON.stringify(target)) 来实现，复杂点的可能会使用 lodash 的 cloneDeep，很少会自己去实现一个深拷贝。虽然知道使用递归去实现，但试过之后发现还是有许多需要注意的地方的。</p></blockquote><h3 id="借助-json-实现"><a class="header-anchor" href="#借助-json-实现" aria-hidden="true">#</a> 借助 JSON 实现</h3><p>这个很简单，一行代码就能实现：</p><div class="language-js"><pre><code><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">parse</span><span class="token punctuation">(</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span><span class="token punctuation">)</span>\n</code></pre></div><p>缺点也很明显，会忽略掉 function 和 undefined，正则表达式，Map，Set 等会变成空对象: <code>{}</code>，而且对象存在循环引用的时候会报错。但是如果确定要拷贝的目标对象不存在这些类型时用起来还是很方便的。</p><p>接下来看看第二种，递归实现</p><h3 id="递归实现简单版本"><a class="header-anchor" href="#递归实现简单版本" aria-hidden="true">#</a> 递归实现简单版本</h3><p>由于对象的值还可以是对象，我们不能确定有多少层级，因此很容易想到使用使用递归实现：</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span><span class="token parameter">target</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> target <span class="token operator">===</span> <span class="token string">&#39;object&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> cloneTarget <span class="token operator">=</span> Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n    <span class="token keyword">const</span> keys <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>\n    <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> keys<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      cloneTarget<span class="token punctuation">[</span>keys<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>target<span class="token punctuation">[</span>keys<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">return</span> cloneTarget\n  <span class="token punctuation">}</span>\n  <span class="token keyword">return</span> target\n<span class="token punctuation">}</span>\n</code></pre></div><p>以上代码很简单，判断如果目标是对象的话，再判断它是 Object 还是 Array，递归遍历其每一项，将值添加到新对象上，最后返回这个新对象，如果目标不是一个对象就直接返回。我们来试一下：</p><div class="language-js"><pre><code><span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span> a<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> b<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span> c<span class="token operator">:</span> <span class="token punctuation">{</span> d<span class="token operator">:</span> <span class="token number">3</span><span class="token punctuation">,</span> e<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token number">4</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> f<span class="token operator">:</span> <span class="token number">5</span><span class="token punctuation">,</span> <span class="token operator">:</span> g<span class="token operator">:</span> <span class="token number">6</span> <span class="token punctuation">}</span><span class="token punctuation">]</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>\n<span class="token keyword">const</span> cloneObj <span class="token operator">=</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>obj<span class="token punctuation">)</span>\nobj<span class="token punctuation">.</span>c<span class="token punctuation">.</span>e<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">.</span>f <span class="token operator">=</span> <span class="token string">&#39;5&#39;</span>\nconsole<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>cloneObj<span class="token punctuation">)</span> <span class="token comment">// { a: 1, b: 2, c: { d: 3, e: [4, { f: 5, : g: 6 }] } }</span>\n</code></pre></div><p>可以看到，修改了原始 obj 其中的某个 key 的值，并没有影响到拷贝对象的值，说明是成功了的。但是这还是有许多问题的，并没有比 <code>JSON.parse(JSON.stringify())</code> 好到哪去，后者解决不了的问题，这个版本的 cloneDeep 同样存在。接下来我们先解决一个循环引用的问题。</p><h3 id="解决循环引用的版本"><a class="header-anchor" href="#解决循环引用的版本" aria-hidden="true">#</a> 解决循环引用的版本</h3><p>我们先来看看用现有的方法拷贝循环引用的对象会发生什么：</p><div class="language-js"><pre><code><span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>a<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> b<span class="token operator">:</span> <span class="token number">2</span> <span class="token punctuation">}</span>\nobj<span class="token punctuation">.</span>obj <span class="token operator">=</span> obj\n<span class="token function">cloneDeep</span><span class="token punctuation">(</span>obj<span class="token punctuation">)</span>\n</code></pre></div><p>控制台直接报错了：<code>Maximum call stack size exceeded</code> ，我们的代码陷入死循环了。</p><p><img src="https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/image-20210630202529411.png" alt="image-20210630202529411"></p><p>那么该如何解决呢？其实也很简单，我们把拷贝过的值存起来，在拷贝的时候先判断是否已经拷贝过，如果有就直接取出来返回，没有再执行 cloneDeep 不就可以了。用流程图可以大概表示成这样：</p><img src="https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/image-20210630212259142.png" alt="image-20210630212259142" style="zoom:67%;"><p>对于上面的 obj，我们把它展开两层是这个样子的：</p><div class="language-json"><pre><code><span class="token punctuation">{</span>\n  a<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>\n  b<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>\n  obj<span class="token operator">:</span> <span class="token punctuation">{</span>\n    a<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>\n    b<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>\n    obj<span class="token operator">:</span> <span class="token punctuation">{</span>...<span class="token punctuation">}</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>对它执行深拷贝那就是这样：obj 为对象 =&gt; 没有被拷贝过 =&gt; 创建一个空对象 cloneTarget 并保存 (obj -&gt; cloneTarget) =&gt; obj.a 和 obj.b 的值添加到 cloneTarget 上 =&gt; obj.obj 为对象且已经拷贝过(obj === obj.obj) =&gt; 直接取出赋值 =&gt; 退出循环。</p><p>要使用对象作为key，很容易想到用 map 来实现，于是代码可以改进为这样：</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> m <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> target <span class="token operator">===</span> <span class="token string">&#39;object&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span>m<span class="token punctuation">.</span><span class="token function">has</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> m<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">const</span> cloneTarget <span class="token operator">=</span> Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n    m<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> cloneTarget<span class="token punctuation">)</span>\n    <span class="token keyword">const</span> keys <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>\n    <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> keys<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      cloneTarget<span class="token punctuation">[</span>keys<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>target<span class="token punctuation">[</span>keys<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">,</span> m<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">return</span> cloneTarget\n  <span class="token punctuation">}</span>\n  <span class="token keyword">return</span> target\n<span class="token punctuation">}</span>\n</code></pre></div><div class="language-js"><pre><code><span class="token keyword">const</span> obj <span class="token operator">=</span> <span class="token punctuation">{</span>a<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> b<span class="token operator">:</span> <span class="token number">2</span> <span class="token punctuation">}</span>\nobj<span class="token punctuation">.</span>obj <span class="token operator">=</span> obj\n<span class="token function">cloneDeep</span><span class="token punctuation">(</span>obj<span class="token punctuation">)</span>\n</code></pre></div><p>再次尝试循环拷贝，可以看到问题已经解决了。但出仍然还有其他问题，我们知道，在 JavaScript 中，当 <code>typeof target === &#39;object&#39;</code> 时，具体的类型并不仅仅只有 Object 和 Array，比如正则表达式、Map、Set等，这样的话我们上面的方法就会返回空对象，因此要进行更为详细的类型判断。</p><h3 id="加入其它类型对象的改进版"><a class="header-anchor" href="#加入其它类型对象的改进版" aria-hidden="true">#</a> 加入其它类型对象的改进版</h3><p>我们先写出来一个获取类型的方法：</p><div class="language-js"><pre><code><span class="token keyword">const</span> <span class="token function-variable function">getType</span> <span class="token operator">=</span> <span class="token parameter">target</span> <span class="token operator">=&gt;</span> <span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token number">8</span><span class="token punctuation">,</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>\n</code></pre></div><p>我们调用这个 getType 方法的时候，可能有以下的返回值：</p><div class="language-js"><pre><code><span class="token string">&quot;Number&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;String&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Boolean&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Undefined&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Null&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Symbol&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;BigInt&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Object&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Array&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;RegExp&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Map&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Set&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;Function&quot;</span>\n</code></pre></div><p>接下来我们对其它类型的 Object 进行处理</p><h4 id="正则表达式的处理"><a class="header-anchor" href="#正则表达式的处理" aria-hidden="true">#</a> 正则表达式的处理</h4><p>对于正则表达式，我们可以通过 RegExp.prototype.source 拿到正则文本，RegExp.prototype.flags 拿到标志参数，有了这两项就可以拷贝这个正则了：</p><div class="language-js"><pre><code>  <span class="token keyword">const</span> <span class="token punctuation">{</span> source<span class="token punctuation">,</span> flags <span class="token punctuation">}</span> <span class="token operator">=</span> reg\n  cloneTarget <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RegExp</span><span class="token punctuation">(</span>source<span class="token punctuation">,</span> flags<span class="token punctuation">)</span>\n</code></pre></div><h4 id="map-和-set-的处理"><a class="header-anchor" href="#map-和-set-的处理" aria-hidden="true">#</a> Map 和 Set 的处理</h4><p>对于 Map 我们只要新建一个 Map 对其递归处理就可以了</p><div class="language-js"><pre><code><span class="token keyword">const</span> cloneTarget <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\ntarget<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">value<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  cloneTarget<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>value<span class="token punctuation">,</span> m<span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><p>对于 Set：</p><div class="language-js"><pre><code><span class="token keyword">const</span> cloneTarget <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\ntarget<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">value</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  cloneTarget<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token function">cloneDeep</span><span class="token punctuation">(</span>value<span class="token punctuation">,</span> m<span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><h4 id="function-类型的处理"><a class="header-anchor" href="#function-类型的处理" aria-hidden="true">#</a> Function 类型的处理</h4><p>对于 Function 类型的处理，我们可以调用 toString 方法将函数转为字符串，在利用 eval 来得到拷贝的函数，处理如下：</p><div class="language-js"><pre><code><span class="token keyword">const</span> funcString <span class="token operator">=</span> target<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> cloneTarget <span class="token operator">=</span> <span class="token function">eval</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">(() =&gt; </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>funcString<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">)()</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span>\ncloneTarget<span class="token punctuation">.</span>prototype <span class="token operator">=</span> target<span class="token punctuation">.</span>prototype <span class="token comment">// 原型指向原函数的原型</span>\n</code></pre></div><p>加入以上几种类型的处理之后，我们的最终版本如下：</p><div class="language-js"><pre><code><span class="token keyword">const</span> <span class="token function-variable function">getType</span> <span class="token operator">=</span> <span class="token parameter">target</span> <span class="token operator">=&gt;</span> <span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token number">8</span><span class="token punctuation">,</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>\n\n<span class="token keyword">function</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> m <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> targetType <span class="token operator">=</span> <span class="token function">getType</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>\n  <span class="token keyword">let</span> cloneTarget\n  <span class="token keyword">switch</span> <span class="token punctuation">(</span>targetType<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Number&#39;</span><span class="token operator">:</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;String&#39;</span><span class="token operator">:</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Boolean&#39;</span><span class="token operator">:</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Undefined&#39;</span><span class="token operator">:</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Null&#39;</span><span class="token operator">:</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Symbol&#39;</span><span class="token operator">:</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;BigInt&#39;</span><span class="token operator">:</span>\n      <span class="token keyword">return</span> target\n    <span class="token keyword">case</span> <span class="token string">&#39;Object&#39;</span><span class="token operator">:</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Array&#39;</span><span class="token operator">:</span>\n      <span class="token comment">// 这里通过构造函数合并了对象和数组的情况</span>\n      cloneTarget <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">target<span class="token punctuation">.</span>constructor</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n      <span class="token keyword">break</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;RegExp&#39;</span><span class="token operator">:</span>\n      <span class="token keyword">const</span> <span class="token punctuation">{</span> source<span class="token punctuation">,</span> flags <span class="token punctuation">}</span> <span class="token operator">=</span> target\n      cloneTarget <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RegExp</span><span class="token punctuation">(</span>source<span class="token punctuation">,</span> flags<span class="token punctuation">)</span>\n      <span class="token keyword">break</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Map&#39;</span><span class="token operator">:</span>\n      cloneTarget <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n      target<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">value<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        cloneTarget<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>value<span class="token punctuation">,</span> m<span class="token punctuation">)</span><span class="token punctuation">)</span>\n      <span class="token punctuation">}</span><span class="token punctuation">)</span>\n      <span class="token keyword">break</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Set&#39;</span><span class="token operator">:</span>\n      cloneTarget <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n      target<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">value</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        cloneTarget<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token function">cloneDeep</span><span class="token punctuation">(</span>value<span class="token punctuation">,</span> m<span class="token punctuation">)</span><span class="token punctuation">)</span>\n      <span class="token punctuation">}</span><span class="token punctuation">)</span>\n      <span class="token keyword">break</span><span class="token punctuation">;</span>\n    <span class="token keyword">case</span> <span class="token string">&#39;Function&#39;</span><span class="token operator">:</span>\n      <span class="token keyword">const</span> funcString <span class="token operator">=</span> target<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n      cloneTarget <span class="token operator">=</span> <span class="token function">eval</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">(() =&gt; </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>funcString<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">)()</span><span class="token template-punctuation string">`</span></span><span class="token punctuation">)</span>\n      cloneTarget<span class="token punctuation">.</span>prototype <span class="token operator">=</span> target<span class="token punctuation">.</span>prototype <span class="token comment">// 原型指向原函数的原型</span>\n      <span class="token keyword">break</span>\n    <span class="token keyword">default</span><span class="token operator">:</span>\n      <span class="token keyword">return</span> target\n  <span class="token punctuation">}</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span>cloneTarget<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span>m<span class="token punctuation">.</span><span class="token function">has</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> m<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n    m<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> cloneTarget<span class="token punctuation">)</span>\n    <span class="token keyword">const</span> keys <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span>\n    <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> keys<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      cloneTarget<span class="token punctuation">[</span>keys<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">cloneDeep</span><span class="token punctuation">(</span>target<span class="token punctuation">[</span>keys<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">,</span> m<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">return</span> cloneTarget\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre></div><h3 id="最后"><a class="header-anchor" href="#最后" aria-hidden="true">#</a> 最后</h3><p>到这里我们已经实现了一个深拷贝的函数了，其中解决了循环引用，函数拷贝，以及 Map 、Set 、正则表达式等多种类型的拷贝。</p><p>如果有什么错误，欢迎指出。</p>',49);p.render=function(a,t,p,e,c,u){return n(),s("div",null,[o])};export default p;export{t as __pageData};
