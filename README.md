# ViewModel Running inside a webworker (Chrome only)

POC

- Uses WebComponents / WebWorkers / OIG-DR for DOM Rendering
- run npm install && npm run test-server
- goto localhost:3000/sandbox 

```
  <body>

  ...

  <oig-view scripts="/viewmodel.js" plugins="handlebars" name="myView">
    <template>
      <div>
        <button onclick="myView.action({{time}})">Click Me 1</button>
        <button onclick="myView.action('Yeah')">Click Me 2</button>
        <b>{{time}} rendered by a mad mans implementation</b>
        <br>
        <i>Time from you{{timeFromYou}}</i>
      </div>
    </template>
  </oig-view>

  ...

  <script src="../../lib/dr.js"></script>
  <script src="../../lib/vm.js"></script>

  ...

  </body>
```