function radar({ el, data, radialLevels, angularLevels, colors }) {
  // Utilities
  // https://github.com/zalando/tech-radar/blob/master/docs/radar.js

  // custom random number generator, to make random sequence reproducible
  // source: https://stackoverflow.com/questions/521295
  var seed = 42;
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function randomBetween(min, max) {
    return min + random() * (max - min);
  }

  function normalBetween(min, max) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  function polar(cartesian) {
    var x = cartesian.x;
    var y = cartesian.y;
    // convert t range from (−π, π] to (−π / 2, π / 2 * 3].
    return {
      t: Math.atan2(y, x) + Math.PI * 2 * (x < 0 && y < 0 ? 1 : 0),
      r: Math.sqrt(x * x + y * y),
    };
  }

  function cartesian(polar) {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t),
    };
  }

  function boundedInterval(value, min, max) {
    var low = Math.min(min, max);
    var high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  }

  const radius = 400;
  const margin = 32;
  const width = (radius + margin) * 2;
  const height = (radius + margin) * 2;
  const angularLabelRadius = radius + 16;
  const blipRadius = 12;

  const nRadialLevels = radialLevels.length;
  const nAngularLevels = angularLevels.length;

  const colorScale = d3
    .scaleOrdinal()
    .domain(d3.range(nAngularLevels))
    .range(colors);

  const opacityScale = d3
    .scaleLinear()
    .domain([0, nRadialLevels - 1])
    .range([1, 0.25]);

  const radialScale = d3
    .scaleSqrt()
    .domain([0, nRadialLevels])
    .range([0, radius]);

  const angularScale = d3
    .scaleBand()
    .domain(d3.range(nAngularLevels))
    .range([-Math.PI / 2, (Math.PI / 2) * 3]);

  data.forEach((d) => {
    d.radius = blipRadius;
    d.rMin = radialScale(d.radialIndex);
    d.rMax = radialScale(d.radialIndex + 1);
    d.r = normalBetween(d.rMin, d.rMax);
    d.tMin = angularScale(d.angularIndex);
    d.tMax = angularScale(d.angularIndex) + angularScale.bandwidth();
    d.t = randomBetween(d.tMin, d.tMax);
    const { x, y } = cartesian(d);
    d.x = x;
    d.y = y;
  });

  d3.forceSimulation()
    .nodes(data)
    .force(
      "collision",
      d3.forceCollide().radius((d) => d.radius)
    )
    .force("limit", forceLimit())
    .tick(300);

  // Modified from https://github.com/vasturiano/d3-force-limit/blob/master/src/limit.js
  function constant(x) {
    return function () {
      return x;
    };
  }
  function forceLimit() {
    let nodes,
      radius = (node) => node.radius,
      rMin = (node) => node.rMin,
      rMax = (node) => node.rMax,
      tMin = (node) => node.tMin,
      tMax = (node) => node.tMax;

    function force(alpha) {
      nodes.forEach((node) => {
        let { r, t } = polar(node);
        const minRadius = rMin(node) + radius(node);
        const maxRadius = rMax(node) - radius(node);
        const minAngle = tMin(node) + radius(node) / r;
        const maxAngle = tMax(node) - radius(node) / r;
        if (r >= minRadius && r <= maxRadius && t >= minAngle && t <= maxAngle)
          return;
        r = boundedInterval(r, minRadius, maxRadius);
        t = boundedInterval(t, minAngle, maxAngle);
        const { x, y } = cartesian({ r, t });
        node.vx = x - node.x;
        node.vy = y - node.y;
      });
    }

    function initialize() {}

    force.initialize = function (_) {
      (nodes = _), initialize();
    };

    force.radius = function (_) {
      return arguments.length
        ? ((radius = typeof _ === "function" ? _ : constant(+_)), force)
        : radius;
    };

    force.rMin = function (_) {
      return arguments.length
        ? ((rMin = typeof _ === "function" ? _ : constant(+_)), force)
        : rMin;
    };

    force.rMax = function (_) {
      return arguments.length
        ? ((rMax = typeof _ === "function" ? _ : constant(+_)), force)
        : rMax;
    };

    force.tMin = function (_) {
      return arguments.length
        ? ((tMin = typeof _ === "function" ? _ : constant(+_)), force)
        : tMin;
    };

    force.tMax = function (_) {
      return arguments.length
        ? ((tMax = typeof _ === "function" ? _ : constant(+_)), force)
        : tMax;
    };

    return force;
  }

  const idPrefix = el.id;

  const container = d3.select(el).classed("radar", true);

  const svg = container
    .selectChildren("svg")
    .data([0])
    .join((enter) =>
      enter
        .append("svg")
        .style("max-width", `${width}px`)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
    );

  svg
    .selectChildren(".grid-areas")
    .data([0])
    .join((enter) => enter.append("g").attr("class", "grid-areas"))
    .selectChildren("g")
    .data(angularLevels)
    .join((enter) => enter.append("g"))
    .selectAll("path")
    .data((angularLevel, angularIndex) =>
      radialLevels.map((radialLevel, radialIndex) => ({
        angularLevel,
        angularIndex,
        radialLevel,
        radialIndex,
      }))
    )
    .join((enter) => enter.append("path"))
    .sort((a, b) => d3.descending(a.radialIndex, b.radialIndex))
    .attr("fill", (d) => colorScale(d.angularIndex))
    .attr("fill-opacity", (d) => opacityScale(d.radialIndex))
    .attr("d", (d) =>
      d3.arc()({
        innerRadius: radialScale(d.radialIndex),
        outerRadius: radialScale(d.radialIndex + 1),
        startAngle: angularScale(d.angularIndex) + Math.PI / 2,
        endAngle:
          angularScale(d.angularIndex) + Math.PI / 2 + angularScale.bandwidth(),
      })
    );

  svg
    .selectChildren(".grid-lines")
    .data([0])
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "grid-lines")
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.25)
        .call((g) => g.append("g").attr("class", "grid-angular-lines"))
        .call((g) => g.append("g").attr("class", "grid-radial-lines"))
    )
    .call((g) =>
      g
        .select(".grid-angular-lines")
        .selectChildren("circle")
        .data(radialLevels)
        .join((enter) =>
          enter
            .append("circle")
            .attr("class", "grid-angular-line")
            .attr("fill", "none")
        )
        .attr("r", (_, radialIndex) => radialScale(radialIndex + 1))
    )
    .call((g) =>
      g
        .select(".grid-radial-lines")
        .selectChildren("line")
        .data(angularLevels)
        .join((enter) => enter.append("line").attr("class", "grid-radial-line"))
        .attr("x2", radius)
        .attr(
          "transform",
          (_, angularIndex) =>
            `rotate(${(angularScale(angularIndex) / Math.PI) * 180})`
        )
    );

  svg
    .selectChildren(".angular-titles")
    .data([0])
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "angular-titles")
        .attr("fill", "currentColor")
    )
    .selectChildren("g")
    .data(angularLevels)
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "angular-title")
        .call((g) => g.append("path").attr("fill", "none"))
        .call((g) =>
          g
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .append("textPath")
            .attr("startOffset", "50%")
        )
    )
    .call((g) =>
      g
        .select("path")
        .attr(
          "id",
          (_, angularIndex) => `${idPrefix}AngularTitlePath${angularIndex}`
        )
        .attr("d", (_, angularIndex) => {
          const midAngle =
            angularScale(angularIndex) + angularScale.bandwidth() / 2;
          const anticlockwise = midAngle > 0 && midAngle < Math.PI;
          const startAngle = anticlockwise
            ? angularScale(angularIndex) + angularScale.bandwidth()
            : angularScale(angularIndex);
          const endAngle = anticlockwise
            ? angularScale(angularIndex)
            : angularScale(angularIndex) + angularScale.bandwidth();
          const { x, y } = cartesian({
            r: angularLabelRadius,
            t: startAngle,
          });
          const path = d3.path();
          path.moveTo(x, y);
          path.arc(
            0,
            0,
            angularLabelRadius,
            startAngle,
            endAngle,
            anticlockwise
          );
          return path.toString();
        })
    )
    .call((g) =>
      g
        .select("text")
        .select("textPath")
        .attr(
          "href",
          (_, angularIndex) => `#${idPrefix}AngularTitlePath${angularIndex}`
        )
        .text((angularLabel) => angularLabel)
    );

  svg
    .selectChildren(".radial-titles")
    .data([0])
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "radial-titles")
        .attr("fill", "currentColor")
    )
    .selectChildren("g")
    .data(radialLevels)
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "radial-title")
        .call((g) => g.append("path").attr("fill", "none"))
        .call((g) =>
          g
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .append("textPath")
            .attr("startOffset", "50%")
        )
    )
    .call((g) =>
      g
        .select("path")
        .attr(
          "id",
          (_, radialIndex) => `${idPrefix}RadialTitlePath${radialIndex}`
        )
        .attr("d", (_, radialIndex) => {
          const startAngle = -Math.PI;
          const endAngle = 0;
          const r = radialScale(radialIndex + 1) - 16;
          const path = d3.path();
          path.moveTo(-r, 0);
          path.arc(0, 0, r, startAngle, endAngle);
          return path.toString();
        })
    )
    .call((g) =>
      g
        .select("text")
        .select("textPath")
        .attr(
          "href",
          (_, radialIndex) => `#${idPrefix}RadialTitlePath${radialIndex}`
        )
        .text((radialLabel) => radialLabel)
    );

  svg
    .selectChildren(".blips")
    .data([0])
    .join((enter) => enter.append("g").attr("class", "blips"))
    .selectChildren("g")
    .data(data)
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "blip")
        .call((g) =>
          g
            .append("text")
            .attr("class", "emoji")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
        )
    )
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .call((g) => g.select("text").text((d) => d.name));
}
