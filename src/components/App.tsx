import { Helmet, HelmetProvider } from 'react-helmet-async'
import "../css/index.css"

import { main, Week, Day, Task, WEEK_DAYS } from "../appController"
import { useEffect, useState } from 'react'

export default function App() {

    let { appStatus, appMethods } = main()
    let [daySelector, setDaySelector] = useState<number>(0)
    let [textPrompt, setTextPrompt] = useState<string>("")
    //useEffect(() => {console.log(textPrompt)},[textPrompt])

    let currentWeek : Week|undefined = appStatus.weeks ? appStatus.weeks[appStatus.currentWeek] : undefined

    return (<>
        <HelmetProvider>
        <Helmet>
            <title>Mi calendario</title>
            <link rel="icon" type="image/png" href="/img/logo.png" sizes="16x16" />
        </Helmet>
        </HelmetProvider>
        <article className="container">
            <section className="header">
                <h1>Calendario Semanal</h1>
                <img src="public/img/logo.png" alt="Logo" className="logo" />
            </section>
            <section className="week-navigation">
                <button onClick={appMethods.subOneMonth}>Semana Anterior</button>
                <span>Semana {appStatus.currentWeek}</span>
                <button onClick={appMethods.addOneMonth}>Semana Siguiente</button>
            </section>
            <form className="form">
                <label>
                    Día:
                    <select value={daySelector} onChange={ev => {setDaySelector(parseInt(ev.target.value))}}>
                        {WEEK_DAYS.map((day, i) => (
                            <option key={i} value={i}>{day}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Tarea:
                    <input onChange={ev => {setTextPrompt(ev.target.value)}}
                        type="text"
                        value={textPrompt}
                        placeholder="Escribe la tarea"
                    />
                </label>
                <button type="submit">Añadir Tarea</button>
            </form>
            <section>
                <h2>Total de tareas esta semana: {appMethods.getWeekTasksCount(currentWeek)}</h2>
                <aside className="calendar">
                    {WEEK_DAYS.map((day, i) => (
                        <div key={i} className="day">
                            <h3>
                                {day} ({appMethods.getDayTasksCount(currentWeek, i)} tareas)
                            </h3>
                            {appMethods.getDayTasks(currentWeek, i).map((task:Task) => (
                                <ul className="task-list">

                                    <li>
                                        {task.name}
                                        <button className="delete-button">
                                            🗑️
                                        </button>
                                    </li>

                                </ul>
                            ))}
                        </div>
                    ))}
                </aside>
            </section>
        </article>
    </>)
}