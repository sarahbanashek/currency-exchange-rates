import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { getCurrencyName } from '../utilities/getCurrencyName';

export function ChartDisplay({data}) {
    const rates = data.rates;
    const base = data.base;
    const propsDate = data.date.split('-');
    const months = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December'
    }
    const titleDate = `${months[propsDate[1]]} ${propsDate[2]}, ${propsDate[0]}`;
  
    return (
      <div id="chart" >
        <div id="chart-title">
          Exchange Rates for the {getCurrencyName(base)} on {titleDate}
        </div>
        <ResponsiveContainer className="chart-container" width="95%" height={400} >
          <BarChart margin={{top: 50, bottom: 50, left: 25}} data={rates}>
            <XAxis dataKey="abbreviation" interval={0} minTickGap={20} tick={<CustomizedXAxisTick />} >
              <Label value="World Currencies" offset={20} position="bottom" fill="#404040" />
            </XAxis>
            <YAxis dataKey="rate" domain={[0.01, 'auto']} scale="log" tick={<CustomizedYAxisTick />} >
              <Label value="Exchange Rate" angle={-90} offset={15} position="left" fill="#404040" />
            </YAxis>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EFEFEF' }} />
            <Bar dataKey="rate" unit={base} >
              {
                rates.map((entry, index) => (
                  <Cell className="bar" key={index} fill={getFillColor(entry.rate)} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
     
    );
}
  
function CustomizedXAxisTick({x, y, _, payload}) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} fontSize="10px" textAnchor="end" fill="#404040" transform="rotate(-35)">{payload.value}</text>
      </g>
    );
}

function CustomizedYAxisTick({x, y, _, payload}) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={5} textAnchor="end" fill="#404040">{Math.round(payload.value * 100000)/100000}</text>
      </g>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (active) {
      return (
        <div className="custom-tooltip">
          <p className="label">{getCurrencyName(label)}</p>
          <p className="rate">{`1 ${payload[0].unit} = ${payload[0].value} ${label}`}</p>
        </div>
      );
    }
  
    return null;
};

function getFillColor(rates) {
    if (rates >= 10000) {
      return "#057878";
    } else if (rates >= 1000) {
      return "#0f8291";
    } else if (rates >= 500) {
      return "#258bac";
    } else if (rates >= 100) {
      return "#3f97bf";
    } else if (rates >= 50) {
      return "#5aa2ca";
    } else if (rates >= 10) {
      return "#78add2";
    } else if (rates >= 5) {
      return "#96b9d9";
    } else if (rates >= 2) {
      return "#b2c3de";
    } else if (rates >= 1) {
      return "#c8cee4";
    } else {
      return "#dad7e9";
    }
}