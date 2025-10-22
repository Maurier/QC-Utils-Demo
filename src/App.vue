<script setup lang="ts">
import { ref } from "vue";
import { testQcUtils, testRegularJS } from "./test";
// @ts-ignore no type definitions
import Plotly from "plotly.js-dist";

const showPlot = ref(false);
const isTestingRegularJs = ref(false);
const isTestingQcUtils = ref(false);
const isTesting = ref(false);
const testResults = ref([]);

const operations = [
  "DELETE",
  "INSERT",
  //  "FIND GAPS", "INTERPOLATE"
];
const startTests = async () => {
  testResults.value = [];
  isTestingRegularJs.value = true;
  isTesting.value = true;
  showPlot.value = true;

  setTimeout(() => {
    initPlot();

    // Will wait for the plot to render before continuing
    setTimeout(async () => {
      const resultsJS = await onTestRegularJs();
      const traceJs = {
        x: operations,
        y: resultsJS.map((r) => r.duration / 1000),
      };

      updateBarChart(traceJs, { x: operations, y: operations.map((o) => 0) });

      setTimeout(async () => {
        const resultsQC = await onTestQcUtils();

        const traceQC = {
          x: operations,
          y: resultsQC.map((r) => r.duration / 1000),
        };

        updateBarChart(traceJs, traceQC);
        isTesting.value = false;
      }, 500);
    });
  });
};

const onTestRegularJs = async () => {
  const measurement = await testRegularJS();
  isTestingRegularJs.value = false;
  return measurement;
};

const onTestQcUtils = async () => {
  isTestingQcUtils.value = true;
  const measurement = await testQcUtils();
  isTestingQcUtils.value = false;
  return measurement;
};

const initPlot = () => {
  const trace1 = {
    x: operations,
    y: [operations.map((o) => 0)],
    name: "REGULAR JS",
    type: "bar",
  };

  const trace2 = {
    x: operations,
    y: [operations.map((o) => 0)],
    name: "QC-UTILS",
    type: "bar",
  };

  const data = [trace1, trace2];
  const layout = {
    barmode: "group",
    title: "Duration",
    paper_bgcolor: "#242424", // Dark background for the entire plot area
    plot_bgcolor: "#242424", // Dark background for the plotting area
    font: {
      color: "white", // White font color for text elements
    },
    xaxis: {
      gridcolor: "#555", // Darker grid lines
      tickfont: {
        color: "white",
      },
    },
    yaxis: {
      gridcolor: "#555",
      tickfont: {
        color: "white",
      },
      range: [0, 60],
    },
    legend: {
      font: {
        color: "white",
      },
    },
  };

  return Plotly.newPlot("graph", data, layout);
};

const updateBarChart = (
  traceJs: { x: string[]; y: number[] },
  traceQc: { x: string[]; y: number[] }
) => {
  let maxY = Math.max(...traceJs.y, ...traceQc.y);
  maxY = maxY + +(maxY / 10).toFixed(0); // 10% padding
  Plotly.animate(
    "graph",
    {
      data: [traceJs, traceQc],
      traces: [0, 1],
      layout: {
        yaxis: {
          range: [0, maxY],
        },
      },
    },
    {
      transition: { duration: 350, easing: "cubic-in-out" },
      frame: { duration: 350 },
    }
  );
};
</script>

<template>
  <div class="container">
    <div
      class="test-btn"
      :class="{ 'is-focused': isTestingRegularJs, disabled: isTesting }"
    >
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      <div>
        {{ isTestingRegularJs ? "Testing regular JS..." : "Regular JS" }}
      </div>
    </div>

    <div
      class="test-btn"
      :class="{ 'is-focused': isTestingQcUtils, disabled: isTesting }"
    >
      <img src="/vite.svg" class="logo" alt="Vite logo" />
      <div>
        {{ isTestingQcUtils ? "Testing QC-Utils..." : "QC-Utils" }}
      </div>
    </div>
  </div>

  <button @click="startTests" :disabled="isTesting">START TEST</button>

  <div id="results-container" v-if="showPlot" class="fade-in">
    <h2>Results</h2>
    <div id="graph"></div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

#graph {
  margin-top: 2rem;
  width: 90%;
  min-width: 50rem;
  border: 1px solid #686868;
  border-radius: 8px;
}

.container {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 2rem;
}

.fade-in {
  opacity: 1;
  animation-name: fadeInOpacity;
  animation-iteration-count: 1;
  animation-timing-function: ease-in;
  animation-duration: 0.35;
}

@keyframes fadeInOpacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.test-btn {
  border: 1px solid #686868;
  border-radius: 8px;
  padding: 2rem;

  &.disabled {
    pointer-events: none;
    filter: grayscale(1);
  }

  &.is-focused {
    filter: none;
    scale: 1.15;
    .logo {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.vue {
      filter: drop-shadow(0 0 2em #42b883aa);
    }
  }

  transition: all 0.15s ease-in-out;
}

#results-container {
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
