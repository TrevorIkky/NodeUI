/* eslint-disable require-jsdoc */
const numSocket = new Rete.Socket('Number value');
const anyTypeSocket = new Rete.Socket('Any type');
const stringSocket = new Rete.Socket('String');
const arraySocket = new Rete.Socket('Array');
numSocket.combineWith(anyTypeSocket);
stringSocket.combineWith(anyTypeSocket);
arraySocket.combineWith(anyTypeSocket);

const postURL = 'http://localhost:3000'


const vueControlComponent = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'inputtype'],
  template: '<input type="inputtype" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  data() {
    return {
      value: 0,
    };
  },
  methods: {
    change(e) {
      this.value = +e.target.value;
      this.update();
    },
    update() {
      if (this.ikey) {
        this.putData(this.ikey, this.value);
      };
      this.emitter.trigger('process');
    },
  },
  mounted() {
    this.value = this.getData(this.ikey);
  },
};

const vueTextControlComponent = {
  props: ['readonly', 'emitter', 'ikey', 'inputtype', 'getData', 'putData'],
  template: '<input type="inputtype" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  data() {
    return {
      value: '',
    };
  },
  methods: {
    change(e) {
      this.value = +e.target.value;
      this.update();
    },
    update() {
      if (this.ikey) {
        this.putData(this.ikey, this.value);
      }
      this.emitter.trigger('process');
    },
  },
  mounted() {
    this.value = this.getData(this.ikey);
  },
};

class NumControl extends Rete.Control {
  constructor(emitter, key, readonly, type = 'number') {
    super(key);
    this.component = vueControlComponent;
    this.props = {
      emitter,
      ikey: key,
      readonly,
      inputtype: type,
    };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

const vueTextControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="text" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop=""/>',
  data() {
    return {
      value: '',
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value)
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
  }
};

class StringControl extends Rete.Control {
  constructor(emitter, key, readonly) {
    super(key);
    this.component = vueTextControl;
    this.props = { emitter, ikey: key, readonly };
  }
  setValue(val) {
    this.vueContext.value = val;
  }
}

const vueLogComponent = {
  props: ['emitter', 'isReadOnly', 'ikey', 'putData', 'getData'],
  template: '<textarea type="text" :readonly="isReadOnly" :value="textVal"  @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""></textarea>',
  data() {
    return {
      textVal: '',
    };
  },
  methods: {
    change(event) {
      this.textVal = +event.target.value;
      this.updateWorkSpace();
    },
    updateWorkSpace() {
      if (this.ikey) {
        this.putData(this.ikey, this.textVal);
        this.emitter.trigger('process');
      }
    },

  },
  mounted() {
    this.textVal = this.getData(this.ikey);
  },
};
class LogControl extends Rete.Control {
  constructor(emitter, key, isReadOnly) {
    super(key);
    this.component = vueLogComponent;
    this.props = {
      emitter,
      isReadOnly,
      key,
    };
  }

  setValue(value) {
    this.vueContext.textVal = value;
  }
}

class TextControl extends Rete.Control {
  constructor(emitter, key, isReadOnly = true, type = 'text') {
    super(key);
    this.component = vueTextControlComponent;
    this.props = {
      emitter,
      ikey: key,
      isReadOnly,
      inputtype: type,
    };
  }

  setValue(value) {
    this.vueContext.value = value;
  }
}

const vueMapsButtonComponents = {
  props: ['emitter', 'key', 'nodeid'],
  template: '<button id = "openMapFromNode" @click="openMap($event)">Add Location<button>',
  data() {
    return;
  },
  methods: {
    openMap(event) {
      openModal(this.key, this.nodeid);
    },

  },
};

class MapsButtonControl extends Rete.Control {
  constructor(emitter, key, nodeid) {
    super(key);
    this.component = vueMapsButtonComponents;
    this.props = {
      emitter,
      key,
      nodeid,
    };
  }
}

const vueEmbedButtonComponents = {
  props: ['emitter', 'key', 'nodeid'],
  template: '<button @click="embed($event)">Embed Output</button>',
  data() {
    return;
  },
  methods: {
    embed(event) {
      const solver = findSolverInstance();
      setTimeout(()=>{
        axios.get('/embed/' + solver.data.problemId).then((response)=> {
          const domparser = new DOMParser()
          const rawHTML = response.data["embedding"];
          const embed = document.getElementById('embed');
          embed.innerHTML = escapeHtml(rawHTML);
          const modal = document.getElementById('embedModal');
          var instance = M.Modal.getInstance(modal);
          PR.prettyPrintOne();
          instance.open();
        }).catch( (error)=> {
          console.log(error);
        });
      }, 1000);
    },
  },
};

class EmbedButtonControl extends Rete.Control {
  constructor(emitter, key, nodeid) {
    super(key);
    this.component = vueEmbedButtonComponents;
    this.props = {
      emitter,
      key,
      nodeid,
    };
  }
}

const vueMapOutputButtonComponents = {
  props: ['emitter', 'key', 'nodeid'],
  template: '<button @click="open($event)">Open Map</button>',
  data() {
    return;
  },
  methods: {
    open(event) {
      var location = this.emitter.nodes.find(n => n.id == this.nodeid).data.location
      window.open(location);
    },
  },
};

class MapOutputButtonControl extends Rete.Control {
  constructor(emitter, key, nodeid) {
    super(key);
    this.component = vueMapOutputButtonComponents;
    this.props = {
      emitter,
      key,
      nodeid,
    };
  }
}

class MapOutputComponent extends Rete.Component {
  constructor(name = 'Map Output') {
    super(name);
  }
  builder(node) {
    return node.addInput(new Rete.Input('location', 'Location',stringSocket))
        .addControl(new MapOutputButtonControl(this.editor, 'mapsButton', node.id))
        .addControl(new EmbedButtonControl(this.editor, 'embedButton', node.id))
  }
  worker(node, inputs, outputs) {
    console.log(inputs["location"]);
    node.data.location =  inputs["location"].length ? inputs['location'][0] : '' ;
  }
}

class LogComponent extends Rete.Component {
  constructor() {
    super('Log');
  }
  builder(node) {
    const inputNode = new Rete.Input('inNode', 'Any', anyTypeSocket);
    return node.addInput(inputNode).addControl(new LogControl(this.editor, 'logPreview', true));
  }
  worker(node, inputs, outputs) {
    const x = inputs['inNode'].length ? inputs['inNode'][0] : 'Log';
    this.editor.nodes.find((y) => y.id == node.id).controls.get('logPreview').setValue(x);
  }
}
class DebugComponent extends Rete.Component {
  constructor(){
    super('Debug');
  }

  builder(node){
    node.addOutput(new Rete.Output('res', 'res', stringSocket));
    node.addControl(new StringControl(this.editor, 'text'));
  }
  worker(node, inputs, outputs) {
    outputs["res"] = node.data.text;
  }
  setValue(val) {
    this.vueContext.value = val;
  }
}

class PackageComponent extends Rete.Component {
  constructor(name = 'Package') {
    super(name);
  }
  builder(node) {
    const sizeNode = new Rete.Output('sizeOutNode', 'Size', numSocket);
    const locationNode = new Rete.Output('locationOutNode', 'Going to', stringSocket);
    return node.addOutput(sizeNode).addOutput(locationNode)
        .addControl(new MapsButtonControl(this.editor, 'mapsButton', node.id))
        .addControl(new TextControl(this.editor, 'latlngNode', true, 'text'))
        .addControl(new NumControl(this.editor, 'sizeOutNode', false, 'number'));
  }
  worker(node, inputs, outputs) {
    outputs['sizeOutNode'] = node.data.sizeOutNode;
    outputs['locationOutNode'] = node.data.latlngNode;
  }
}

class NumComponent extends Rete.Component {
  constructor() {
    super('Number');
  }

  builder(node) {
    const out1 = new Rete.Output('num', 'Number', numSocket);
    return node
        .addControl(new NumControl(this.editor, 'num'))
        .addOutput(out1);
  }

  worker(node, inputs, outputs) {
    outputs['num'] = node.data.num;
  }
}


class AggregateComponent extends Rete.Component {
  constructor() {
    super('Aggregate');
  }

  builder(node) {
    const inNode = new Rete.Input('inNum', 'Number', numSocket, true);
    const counter = new Rete.Output('counterNum', 'Count', numSocket);
    const aggregate = new Rete.Output('aggregateNum', 'Aggregate', arraySocket);

    return node.addInput(inNode)
        .addControl(new NumControl(this.editor, 'aggregateView', false))
        .addControl(new TextControl(this.editor, 'countView', true)).addOutput(counter)
        .addOutput(aggregate);
  }

  worker(node, inputs, outputs) {
    const aggregation = Array.from(inputs['inNum']);
    outputs['aggregateNum'] = aggregation;
    const count = aggregation.length;
    console.log(aggregation);
    outputs['counterNum'] = count;
    const searchComponent = this.editor.nodes.find((x) => x.id == node.id);
    searchComponent.controls.get('aggregateView').setValue(aggregation);
    searchComponent.controls.get('countView').setValue(count);
  }
}


class MultiplierComponent extends Rete.Component {
  constructor() {
    super('Multiplier');
  }
  builder(node) {
    const inputOne = new Rete.Input('inpOne', 'Number', numSocket);
    const inputTwo = new Rete.Input('inpTwo', 'Number', numSocket);
    const outputNumber = new Rete.Output('outOne', 'Number', numSocket);
    return node.addInput(inputOne).addInput(inputTwo)
        .addControl(new NumControl(this.editor, 'multiplierPreview', false))
        .addOutput(outputNumber);
  }

  worker(node, inputs, outputs) {
    const x = inputs['inpOne'].length ? inputs['inpOne'][0] : 0;
    const y = inputs['inpTwo'].length ? inputs['inpTwo'][0] : 0;
    const result = x * y;
    this.editor.nodes.find((nd) =>
      nd.id == node.id
    ).controls.get('multiplierPreview').setValue(result);
    outputs['outOne'] = result;
  }
}


class RouteSolverComponent extends Rete.Component {
  constructor() {
    super('Solver');
  }
  builder(node) {
    const inputPackageSizeArr = new Rete.Input('packageArr', 'Packages Sizes', arraySocket);
    const inputDistanceArr = new Rete.Input('distanceArr', 'Distance Matrix', arraySocket);
    const inputVehicleCount = new Rete.Input('vehicleCount', 'Number of vehicles', numSocket);
    const vehiclesArr = new Rete.Input('vehicleArr', 'Vehicles', arraySocket);
    const result = new Rete.Output('result', 'Result', stringSocket);
    return node.addInput(inputPackageSizeArr)
        .addInput(inputDistanceArr)
        .addInput(inputVehicleCount)
        .addInput(vehiclesArr)
        .addOutput(result);
  }

  worker(node, inputs, outputs) {
    node.data.packageSizes = inputs['packageArr'];
    node.data.distanceMatrix = inputs['distanceArr'];
    node.data.vehicles = inputs['vehicleCount'];
    node.data.vehicleCapacities = inputs['vehicleArr'];
    outputs['result'] = node.data.result;
  }
}

class AddComponent extends Rete.Component {
  constructor() {
    super('Add');
  }

  builder(node) {
    const inp1 = new Rete.Input('num', 'Number', numSocket);
    const inp2 = new Rete.Input('num2', 'Number2', numSocket);
    const out = new Rete.Output('num', 'Number', numSocket);

    inp1.addControl(new NumControl(this.editor, 'num'));
    inp2.addControl(new NumControl(this.editor, 'num2'));

    return node
        .addInput(inp1)
        .addInput(inp2)
        .addControl(new NumControl(this.editor, 'preview', false))
        .addOutput(out);
  }

  worker(node, inputs, outputs) {
    const n1 = inputs['num'].length ? inputs['num'][0] : node.data.num1;
    const n2 = inputs['num2'].length ? inputs['num2'][0] : node.data.num2;
    const sum = n1 + n2;

    this.editor.nodes.find((n) => n.id == node.id).controls.get('preview').setValue(sum);
    outputs['num'] = sum;
  }
}


class CalculateDistance extends Rete.Component {
  constructor() {
    super('Calculate Distance');
  }

  builder(node) {
    const inNode = new Rete.Input('location', 'Location', stringSocket, true);
    const outNode = new Rete.Output('matrix', 'Matrix', arraySocket);
    return node.addInput(inNode)
        .addOutput(outNode);
  }

  worker(node, inputs, outputs) {
    const input = Array.from(inputs['location']);
    const distanceArr = [];
    const inarr = input.map((element) => {
      const latlng = element.split(',', 2);
      const to = turf.point([parseFloat(latlng[1]), parseFloat(latlng[0])]);
      return to;
    });
    input.forEach((element) => {
      const latlng = element.split(',', 2);
      const from = turf.point([parseFloat(latlng[1]), parseFloat(latlng[0])]);

      // Change to user's prefered location
      // const from = turf.point([-1.308869, 36.8098883]);
      const distM = inarr.map((element) => {
        const options = {units: 'kilometers'};
        const distance = turf.distance(from, element, options);
        return Math.floor(distance);
      })
      console.log(distM);
      distanceArr.push(distM);
    });

    outputs['matrix'] = distanceArr;
  }
}

const container = document.querySelector('#rete');
const editor = new Rete.NodeEditor('demo@0.1.0', container);
const add = document.getElementById('add');
const number = document.getElementById('number');
const package = document.getElementById('package');
const multiply = document.getElementById('multiply');
const calcDist = document.getElementById('calc-distance');
const mapOutput = document.getElementById('map-output');
const routeSolver = document.getElementById('route-solver');
const debug = document.getElementById('debug');

(async () => {
  const components = [new NumComponent(),
    new AddComponent(),
    new DebugComponent(),
    new MultiplierComponent(),
    new AggregateComponent(),
    new LogComponent(),
    new PackageComponent(),
    new MapOutputComponent(),
    new CalculateDistance(),
    new RouteSolverComponent(),
  ];


  editor.use(ConnectionPlugin.default);
  editor.use(VueRenderPlugin.default);
  editor.use(ContextMenuPlugin.default);
  editor.use(AreaPlugin);
  editor.use(CommentPlugin.default);
  editor.use(HistoryPlugin);
  editor.use(ConnectionMasteryPlugin.default);

  const engine = new Rete.Engine('demo@0.1.0');

  components.map((c) => {
    editor.register(c);
    engine.register(c);
  });


  editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
    console.log('process');
    await engine.abort();
    await engine.process(editor.toJSON());
  });


  editor.on('nodecreated', ()=>{
    document.getElementById('no-nodes').style.height = '0';
    $('#node-list').css({'top': '0px'});
  });

  editor.view.resize();
  AreaPlugin.zoomAt(editor);
  editor.trigger('process');

  // TODO...find inprovements to avoid repetition

  add.addEventListener('click', async ()=>{
    const an = await components[1].createNode({num: 2});
    an.position = [generateRandomInteger(0, 10), generateRandomInteger(0, 40)];
    editor.addNode(an);
  });

  multiply.addEventListener('click', async ()=>{
    const an = await components[2].createNode({num: 2});
    an.position = [generateRandomInteger(0, 10), generateRandomInteger(0, 40)];
    editor.addNode(an);
  });


  number.addEventListener('click', async ()=>{
    const an = await components[0].createNode({num: 2});
    an.position = [generateRandomInteger(0, 10), generateRandomInteger(0, 40)];
    editor.addNode(an);
  });


  package.addEventListener('click', async ()=>{
    const an = await components[5].createNode({num: 2});
    an.position = [generateRandomInteger(0, 10), generateRandomInteger(0, 40)];
    editor.addNode(an);
  });


  calcDist.addEventListener('click', async ()=>{
    const an = await components[6].createNode({num: 2});
    an.position = [generateRandomInteger(0, 10), generateRandomInteger(0, 40)];
    editor.addNode(an);
  });

  routeSolver.addEventListener('click', async ()=>{
    const an = await components[7].createNode({num: 2});
    an.position = [generateRandomInteger(0, 10), generateRandomInteger(0, 40)];
    editor.addNode(an);
  });
})();


$('#build-solution').on('click', async ()=>{
  document.getElementById('progress-loader').style.height = '3px';
  // eslint-disable-next-line max-len
  await returnEditorNodes().then((resp) => {
    applyChanges(resp);
  });
});

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems, {
    onOpenEnd: () => {
      map.resize(); 
    },
  });
});

// Extract all locations from package nodes
const findLocations = (nodes) => {
  return nodes.filter((node) => node.name == 'Package')
    .map((elem) => {
      const coords = elem.data.latlngNode.split(',', 2);
      return coords.map(parseFloat);
    });
};

const findSolverInstance = () => {
  const solverNames = ['Solver']
  const solver = editor.nodes.find((node) => solverNames.includes(node.name));
  return solver;
}

const applyChanges = (resp) =>{
  console.log(resp);
  /*
   * meta field contains information that is passed on to
   * be stored together with the model's results
   */
  resp["meta"] = {
    locations:findLocations(editor.nodes)
  }
  setTimeout(()=>{
    axios.post(postURL + '/routing', {
      data: resp,
    }).then((response)=> {
      const solver = findSolverInstance();
      solver.data.result = response.headers.location;
      solver.data.problemId = response.headers.location.split('/')[2];
      document.getElementById('progress-loader').style.height = '0px';
    }).catch( (error)=> {
      console.log(error);
    });
  }, 1000);
};

const generateRandomInteger = (min, max) =>{
  return Math.floor(min + Math.random()*(max + 1 - min));
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }


const returnEditorNodes = async () =>{
  const solver = editor.nodes.find((node) => node.name == 'Solver');
  return solver.data;
};
