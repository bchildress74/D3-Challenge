// parameters
var svgWidth = 950;
var svgHeight = 500;

var axisDelay = 100;
var circleDely = 10000;

//margin
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

//chart dimension
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// svg wrapper
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append svg
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

function rowConverter(row) {
    row.poverty = +row.poverty;
    row.age = +row.age;
    row.income = +row.income;
    row.healthcare = +row.healthcare;
    row.smokes = +row.smokes;
    row.obesity = +row.obesity;
    return row;
}

// get csv data
d3.csv("assets/data/data.csv", rowConverter)
    .then(createChart)


function createChart(censusData) {
    var activeInfo = {
        data: censusData,
        currentX: "poverty",
        currentY: "healthcare",
    };

    activeInfo.xScale = d3.scaleLinear()
        .domain(getXDomain(activeInfo))
        .range([0, chartWidth]);

    activeInfo.yScale = d3.scaleLinear()
        .domain(getYDomain(activeInfo))
        .range([chartHeight, 0])

    activeInfo.xAxis = d3.axisBottom(activeInfo.xScale);
    activeInfo.yAxis = d3.axisLeft(activeInfo.yScale);

    createAxis(activeInfo);

    createCircles(activeInfo);

    createToolTip(activeInfo);

    createLabels()


    d3.selectAll(".aText").on("click", function () {
        handleClick(d3.select(this), activeInfo)
    })

}



function handleClick(label, activeInfo) {

    var axis = label.attr("data-axis")
    var name = label.attr("data-name");

    if (label.classed("active")) {
        return;
    }

    updateLabel(label, axis)
    createToolTip(activeInfo)
    if (axis === "x") {
        activeInfo.currentX = name;
        activeInfo.xScale.domain(getXDomain(activeInfo))
        renderXAxes(activeInfo)
        renderHorizontal(activeInfo)
    } else 
    {
        activeInfo.currentY = name;
        activeInfo.yScale.domain(getYDomain(activeInfo))
        renderYAxes(activeInfo)
        renderVertical(activeInfo)
    }

    createToolTip(activeInfo)
}

function createLabels() {
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("data-name", "poverty") 
        .attr("data-axis", "x")
        .attr("class", "aText active x")
        .text("In Poverty (%)");

    xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("data-name", "age")
        .attr("data-axis", "x")
        .attr("class", "aText inactive x")
        .text("Age (Median)");

    xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("data-name", "income") 
        .attr("data-axis", "x")
        .attr("class", "aText inactive x")
        .text("Household Income (Median)");

    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    yLabelsGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 0 - (margin.left / 3))
        .attr("data-name", "healthcare") 
        .attr("data-axis", "y")
        .attr("class", "aText active y")
        .text("Lacks Healthcare (%)");

    yLabelsGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", -20 - (margin.left / 3))
        .attr("data-name", "obesity") 
        .attr("data-axis", "y")
        .attr("class", "aText inactive y")
        .text("Obese (%)");

    yLabelsGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", -40 - (margin.left / 3))
        .attr("data-name", "smokes") 
        .attr("data-axis", "y")
        .attr("class", "aText inactive y")
        .text("Smokers (%)");

}

function createCircles(activeInfo) {

    var currentX = activeInfo.currentX
    var currentY = activeInfo.currentY
    var xScale = activeInfo.xScale
    var yScale = activeInfo.yScale

    chartGroup.selectAll("circle")
        .data(activeInfo.data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[currentX]))
        .attr("cy", d => yScale(d[currentY]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5")

    chartGroup.selectAll(null)
        .data(activeInfo.data)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xScale(d[currentX]))
        .attr("y", d => yScale(d[currentY]))
        .attr("class", "text-circle")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
}

function createAxis(activeInfo) {

    chartGroup.append("g")
        .call(activeInfo.yAxis)
        .attr("class", "y-axis")


    chartGroup.append("g")
        .call(activeInfo.xAxis)
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${chartHeight})`)
}

function renderXAxes(activeInfo) {
    chartGroup.select(".x-axis").transition()
        .duration(axisDelay)
        .call(activeInfo.xAxis);
}

function renderYAxes(activeInfo) {
    chartGroup.select(".y-axis").transition()
        .duration(axisDelay)
        .call(activeInfo.yAxis);
}


function getXDomain(activeInfo) {
    var min = d3.min(activeInfo.data, d => d[activeInfo.currentX])
    var max = d3.max(activeInfo.data, d => d[activeInfo.currentX])
    return [min * 0.8, max * 1.2]
}

function getYDomain(activeInfo) {
    var min = d3.min(activeInfo.data, d => d[activeInfo.currentY])
    var max = d3.max(activeInfo.data, d => d[activeInfo.currentY])
    return [min - 1, max]
}

function renderHorizontal(activeInfo) {

    d3.selectAll("circle")
        .each(function () {
            d3.select(this)
                .transition()
                .attr("cx", d => activeInfo.xScale(d[activeInfo.currentX]))
                .duration(circleDely)
        })

    d3.selectAll(".text-circle")
        .each(function () {
            d3.select(this)
                .transition()
                .attr("x", d => activeInfo.xScale(d[activeInfo.currentX]))
                .duration(circleDely)
        })
}

/********************************************/
function renderVertical(activeInfo) {
    d3.selectAll("circle")
        .each(function () {
            d3.select(this)
                .transition()
                .attr("cy", d => activeInfo.yScale(d[activeInfo.currentY]))
                .duration(circleDely)
        })

    d3.selectAll(".text-circle")
        .each(function () {
            d3.select(this)
                .transition()
                .attr("y", d => activeInfo.yScale(d[activeInfo.currentY]))
                .duration(circleDely)
        })

}

function updateLabel(label, axis) {

    d3.selectAll(".aText")
        .filter("." + axis)
        .filter(".active")
        .classed("active", false)
        .classed("inactive", true);

    label.classed("inactive", false).classed("active", true)
}

function createToolTip(activeInfo) {
    var xlabel;
    var ylabel;

    if (activeInfo.currentX === "poverty") {
        xlabel = "% in Poverty: ";
    } else if (activeInfo.currentX === "age") {
        xlabel = "Median Age: ";
    } else {
        xlabel = "Median Income: ";
    }

    if (activeInfo.currentY === "healthcare") {
        ylabel = "% Lacks Healthcare: ";
    } else if (activeInfo.currentY === "obesity") {
        ylabel = "% Obese: ";
    } else {
        ylabel = "% Smokers: ";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            var html = xlabel +
                d[activeInfo.currentX] + 
                "<br>" + ylabel +
                d[activeInfo.currentY] ;

            return html;
        });

    chartGroup.call(toolTip);

    d3.selectAll("circle").on("mouseover", function (data) {
        toolTip.show(data)
    }).on("mouseout", function (data, index) {
        toolTip.hide(data);
    });
}