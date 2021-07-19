export function SelectDate({updateChartDate, isLoading, data}) {
    const today = new Date().toISOString().split("T")[0];
    function changeDate(e) {
      updateChartDate(e.target.value);
    }
  
    return (
      <div id="select-date">
        <label htmlFor="date">Select a date</label>
        {isLoading
          ? <input type="date" id="date"
              value={data.date}
              placeholder="yyyy-mm-dd"
              disabled />
          : <input type="date" id="date"
              value={data.date}
              min="1999-02-01" 
              max={today}
              pattern="\d{4}-\d{2}-\d{2}"
              placeholder="yyyy-mm-dd"
              onChange={(e) => changeDate(e)}/>
              }
        <div id="date-info">from January 4th, 1999</div>
      </div>
    );
}
