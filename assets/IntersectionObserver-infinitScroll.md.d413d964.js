import{o as n,c as s,a}from"./app.d2162012.js";const t='{"title":"IntersectionObserver 之无限滚动","description":"","frontmatter":{"title":"IntersectionObserver 之无限滚动","date":"2019-12-11","tags":["JavaScript"],"describe":"最近的一个开发需求中需要实现一个双向的无限滚动，即列表加载后列表顶部不是第一条数据，而是中间的某一条数据，向上滚动到顶部时，加载之前的数据，向下滚动到底部时，加载之后的数据。首先想到的是使用 `vue-infinite-loading` 组件，因为之前实现单向的无限滚动已经在项目中使用过，试过之后结果发现并不能满足双向无限滚动，于是便自己动手实现了。首先想到的是通过监听 `scroll` 事件实现，后来发现一个非常适合用于无限滚动的 API： `IntersectionObserver` ，于是改用 `IntersectionObserver` 来实现了。"},"relativePath":"IntersectionObserver-infinitScroll.md","lastUpdated":1633703210761}',p={},o=[a('<p><em>最近的一个开发需求中需要实现一个双向的无限滚动，即列表加载后列表顶部不是第一条数据，而是中间的某一条数据，向上滚动到顶部时，加载之前的数据，向下滚动到底部时，加载之后的数据。首先想到的是使用 <code>vue-infinite-loading</code> 组件，因为之前实现单向的无限滚动已经在项目中使用过，试过之后结果发现并不能满足双向无限滚动，于是便自己动手实现了。首先想到的是通过监听 <code>scroll</code> 事件实现，后来发现一个非常适合用于无限滚动的 API： <code>IntersectionObserver</code> ，于是改用 <code>IntersectionObserver</code> 来实现了。</em></p><h4 id="语法"><a class="header-anchor" href="#语法" aria-hidden="true">#</a> 语法</h4><p>使用方法非常简单：</p><div class="language-js"><pre><code><span class="token keyword">const</span> observer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">IntersectionObserver</span><span class="token punctuation">(</span>callback<span class="token punctuation">,</span> options<span class="token punctuation">)</span>\n</code></pre></div><p><code>IntersectionObserver</code> 为浏览器原生的一个构造函数(IE: 为啥我没有？)。接收两个参数，<code>callback</code> 回调函数和 <code>options</code> 配置选项，其中第二个参数 <code>options</code> 为可选参数。</p><p><code>callback</code> 回调函数有两个参数：</p><ul><li><p><code>entries</code></p><p>一个 <code>IntersectionObserverEntry</code> 对象的数组</p></li><li><p>observer</p><p>被调用的 <code>IntersectionObserver</code> 实例</p></li></ul><p><code>options</code> 有三个可配置选项：</p><ul><li><p><code>root</code></p><p>被监听元素的父元素或祖先元素，被监听元素与其交叉达到阈值时将会触发回调函数，默认为 <code>document</code></p></li><li><p><code>rootMargin</code></p><p>计算交叉值时添加至根边界的一组偏移量，类型为字符串类型，默认为 “0px 0px 0px 0px”，语法和CSS 中的 margin 基本一致。</p></li><li><p><code>threshold</code></p><p>规定监听目标元素与 <code>root</code> 元素交叉的比例值，可以是一个 0 到1.0 之间的一个具体数值，也可以是一组 0 到 1.0 之间的数值组成的数组，默认为 0.0</p></li></ul><h4 id="方法"><a class="header-anchor" href="#方法" aria-hidden="true">#</a> 方法</h4><div class="language-js"><pre><code><span class="token comment">// 开始观察</span>\nobserver<span class="token punctuation">.</span><span class="token function">observe</span><span class="token punctuation">(</span>element<span class="token punctuation">)</span>\n<span class="token comment">// 停止观察</span>\nobserver<span class="token punctuation">.</span><span class="token function">unobserve</span><span class="token punctuation">(</span>element<span class="token punctuation">)</span>\n<span class="token comment">// 关闭观察器</span>\nobserver<span class="token punctuation">.</span><span class="token function">disconnect</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><h4 id="实现双向无限滚动"><a class="header-anchor" href="#实现双向无限滚动" aria-hidden="true">#</a> 实现双向无限滚动</h4><p>通过在列表顶部和底部各添加一个 <code>li</code> 元素，当向上滚动，顶部的 <code>li</code> 元素出现时，则从列表顶部插入一定量的数据，当向下滚动至底部的 <code>li</code> 元素出现时，则从列表底部插入一定量的数据。从顶部插入数据的时候有一点需要处理的是：插入数据后，列表直接就到了顶部，因此需要多一步操作，通过 <code>scrollTop</code> 将列表的位置设为触发加载时的位置，代码如下：</p><div class="language-vue"><pre><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span> <span class="token attr-name">ref</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>container<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>top<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>li</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span> <span class="token attr-name">v-for</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>item in list<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>{{ item }}<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>li</span><span class="token punctuation">&gt;</span></span>\n        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>bottom<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>li</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span>\n\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">\n    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>\n        <span class="token function">data</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">return</span> <span class="token punctuation">{</span>\n                list<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token operator">-</span><span class="token number">5</span><span class="token punctuation">,</span> <span class="token operator">-</span><span class="token number">4</span><span class="token punctuation">,</span> <span class="token operator">-</span><span class="token number">3</span><span class="token punctuation">,</span> <span class="token operator">-</span><span class="token number">2</span><span class="token punctuation">,</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">,</span> <span class="token number">4</span><span class="token punctuation">,</span> <span class="token number">5</span><span class="token punctuation">]</span><span class="token punctuation">,</span>\n                observer<span class="token operator">:</span> <span class="token keyword">null</span>\n            <span class="token punctuation">}</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        <span class="token function">mounted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">const</span> root <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>$refs<span class="token punctuation">.</span>container\n            <span class="token keyword">const</span> observer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">IntersectionObserver</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>loadMore<span class="token punctuation">,</span> <span class="token punctuation">{</span>\n              root<span class="token punctuation">,</span>\n              threshold<span class="token operator">:</span> <span class="token number">0</span>\n            <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n            <span class="token keyword">this</span><span class="token punctuation">.</span>$refs<span class="token punctuation">.</span>container<span class="token punctuation">.</span>scrollTop <span class="token operator">=</span> <span class="token number">200</span><span class="token punctuation">;</span>\n            observer<span class="token punctuation">.</span><span class="token function">observe</span><span class="token punctuation">(</span>document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&quot;.top&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 观察顶部的元素</span>\n            observer<span class="token punctuation">.</span><span class="token function">observe</span><span class="token punctuation">(</span>document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&quot;.bottom&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 观察底部的元素</span>\n            <span class="token keyword">this</span><span class="token punctuation">.</span>observer <span class="token operator">=</span> observer<span class="token punctuation">;</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        <span class="token function">beforeDestroy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">this</span><span class="token punctuation">.</span>observer<span class="token punctuation">.</span><span class="token function">disconnect</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n            <span class="token keyword">this</span><span class="token punctuation">.</span>observer <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        methods<span class="token operator">:</span> <span class="token punctuation">{</span>\n            <span class="token function">loadMore</span><span class="token punctuation">(</span><span class="token parameter">entries<span class="token punctuation">,</span> observer</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">const</span> <span class="token punctuation">[</span>entry<span class="token punctuation">]</span> <span class="token operator">=</span> entries<span class="token punctuation">;</span>\n            <span class="token keyword">const</span> <span class="token punctuation">{</span> target <span class="token punctuation">}</span> <span class="token operator">=</span> entry<span class="token punctuation">;</span>\n\n            <span class="token keyword">if</span> <span class="token punctuation">(</span>target<span class="token punctuation">.</span>className<span class="token punctuation">.</span><span class="token function">includes</span><span class="token punctuation">(</span><span class="token string">&quot;top&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n                <span class="token keyword">const</span> elHeight <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>$refs<span class="token punctuation">.</span>container<span class="token punctuation">.</span>scrollHeight<span class="token punctuation">;</span>\n                console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>elHeight<span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token keyword">const</span> arr0 <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>list<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>\n                <span class="token keyword">this</span><span class="token punctuation">.</span>list<span class="token punctuation">.</span><span class="token function">unshift</span><span class="token punctuation">(</span>arr0 <span class="token operator">-</span> <span class="token number">5</span><span class="token punctuation">,</span> arr0 <span class="token operator">-</span> <span class="token number">4</span><span class="token punctuation">,</span> arr0 <span class="token operator">-</span> <span class="token number">3</span><span class="token punctuation">,</span> arr0 <span class="token operator">-</span> <span class="token number">2</span><span class="token punctuation">,</span> arr0 <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">$nextTick</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n                    <span class="token keyword">const</span> newEl <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>$refs<span class="token punctuation">.</span>container<span class="token punctuation">;</span>\n                    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>newEl<span class="token punctuation">.</span>scrollHeight<span class="token punctuation">)</span><span class="token punctuation">;</span>\n                      <span class="token keyword">this</span><span class="token punctuation">.</span>$refs<span class="token punctuation">.</span>container<span class="token punctuation">.</span>scrollTop <span class="token operator">=</span> newEl<span class="token punctuation">.</span>scrollHeight <span class="token operator">-</span> elHeight<span class="token punctuation">;</span>\n                <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n              <span class="token punctuation">}</span>\n            <span class="token keyword">if</span> <span class="token punctuation">(</span>target<span class="token punctuation">.</span>className<span class="token punctuation">.</span><span class="token function">includes</span><span class="token punctuation">(</span><span class="token string">&quot;bottom&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n                <span class="token keyword">const</span> arrLast <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>list<span class="token punctuation">[</span><span class="token keyword">this</span><span class="token punctuation">.</span>list<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">;</span>\n                <span class="token keyword">this</span><span class="token punctuation">.</span>list<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>\n                  arrLast <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">,</span>\n                  arrLast <span class="token operator">+</span> <span class="token number">2</span><span class="token punctuation">,</span>\n                  arrLast <span class="token operator">+</span> <span class="token number">3</span><span class="token punctuation">,</span>\n                  arrLast <span class="token operator">+</span> <span class="token number">4</span><span class="token punctuation">,</span>\n                  arrLast <span class="token operator">+</span> <span class="token number">5</span>\n                <span class="token punctuation">)</span><span class="token punctuation">;</span>\n              <span class="token punctuation">}</span>\n            <span class="token punctuation">}</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span>\n</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n</code></pre></div><p>相对于监听 <code>scroll</code> 事件，使用 <code>IntersectionObserver</code> 不会频繁触发回调，因此不用担心性能问题，也不用去写节流函数。除了用于无限滚动，<code>IntersectionObserver</code> 还可用于图片的懒加载，动画的触发等场景</p><p><em>在线体验demo：<a href="https://codesandbox.io/s/infinite-scroll-6y6w3" target="_blank" rel="noopener noreferrer">https://codesandbox.io/s/infinite-scroll-6y6w3</a></em></p>',16)];p.render=function(a,t,p,e,c,u){return n(),s("div",null,o)};export{t as __pageData,p as default};
