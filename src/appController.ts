import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react"

const MAX_MONTH_COUNT = 52
export const WEEK_DAYS = [
    "Lunes","Martes","Miercoles","Jueves","Viernes","Sábado","Domingo"
]

export type Task = {
    name: string,
    id: string
}

export type Day = {
    tasks: Task[]
}

export type Week = {
    days: Day[]
}

export type Status = {
    currentWeek: number
    weeks: Week[]
    idCounter: number
}

function getWeekNumber(d : Date) : number {
    
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7))
    
    let yearStart: Date = new Date(Date.UTC(d.getUTCFullYear(),0,1))
    
    let weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7)
    
    return weekNo
}

function recoverStorageData(): Status {

    let appStatus: Status

    if(localStorage.getItem("appStatus")){
        appStatus = JSON.parse(localStorage.getItem("appStatus")!) as Status
        if(!appStatus.weeks){
            appStatus.weeks = []
        }
        if(!appStatus.idCounter){
            appStatus.idCounter = 0
        }
    }else{
        appStatus = {
            currentWeek: 0,
            weeks: [],
            idCounter: 0
        }
    }

    appStatus.currentWeek = getWeekNumber(new Date())

    if(appStatus.currentWeek > MAX_MONTH_COUNT){
        appStatus.currentWeek = MAX_MONTH_COUNT
    }
    if(appStatus.currentWeek < 1){
        appStatus.currentWeek = 1
    }

    return appStatus
}

export function main() {
    let [appStatus, setAppStatus] = useState<Status>(recoverStorageData())

    useEffect(() => {
        localStorage.setItem("appStatus", JSON.stringify(appStatus))
    }, [appStatus])

    let appMethods = {
        addOneMonth: (): void => {
            if(appStatus.currentWeek + 1 <= MAX_MONTH_COUNT){
                setAppStatus({...appStatus, currentWeek: appStatus.currentWeek + 1})
            }
        },
        subOneMonth: (): void => {
            if(appStatus.currentWeek - 1 >= 1){
                setAppStatus({...appStatus, currentWeek: appStatus.currentWeek - 1})
            }
        },
        getDayTasksCount: (currentWeek:Week|undefined, day:number): number => {
            if(!currentWeek){
                return 0
            }else if(!currentWeek.days[day]){
                return 0
            }else{
                return currentWeek.days[day].tasks.length
            }
        },
        getWeekTasksCount: (currentWeek:Week|undefined): number => {
            if(!currentWeek){
                return 0
            }else if(!currentWeek.days){
                return 0
            }else{
                let count = 0
                currentWeek.days.forEach(day => {
                    if(day){
                        day.tasks.forEach(() => {
                            count++
                        })
                    }
                })

                return count
            }
        },
        getDayTasks: (currentWeek:Week|undefined, day:number): Task[] => {
            if(!currentWeek){
                return []
            }else if(!currentWeek.days[day]){
                return []
            }else{
                return currentWeek.days[day].tasks
            }
        },
        removeTask: (day: number, taskId: string): void => {
            let newAppStatus:Status = {
                currentWeek: appStatus.currentWeek,
                weeks:[],
                idCounter: appStatus.idCounter + 1
            }
            appStatus.weeks.forEach((week,i) => {
                if(week){
                    newAppStatus.weeks[i] = appMethods.cloneWeek(week)
                }
            })

            newAppStatus.weeks[appStatus.currentWeek].days[day].tasks = newAppStatus.weeks[appStatus.currentWeek].days[day].tasks.filter(task => task.id !== taskId)

            setAppStatus(newAppStatus)
        },
        createTask: (appStatus:Status, day:number, taskName:string): void => {

            let newAppStatus:Status = {
                currentWeek: appStatus.currentWeek,
                weeks:[],
                idCounter: appStatus.idCounter + 1
            }
            appStatus.weeks.forEach((week,i) => {
                if(week){
                    newAppStatus.weeks[i] = appMethods.cloneWeek(week)
                }
            })

            if(!newAppStatus.weeks[appStatus.currentWeek]){
                newAppStatus.weeks[appStatus.currentWeek] = {days: []}
            }

            let week = newAppStatus.weeks[appStatus.currentWeek]

            if(!week.days[day]){
                week.days[day] = {
                    tasks:[
                        {
                            name: taskName, 
                            id: "task" + (appStatus.idCounter + 1)
                        }
                    ]
                }
            }else{
                week.days[day] = {
                    tasks:[
                        ...week.days[day].tasks,
                        {
                            name: taskName, 
                            id: "task" + (appStatus.idCounter + 1)
                        }
                    ]
                }
            }

            //let weeks = {...newAppStatus.weeks}
            //weeks[appStatus.currentWeek] = week
            newAppStatus.weeks[newAppStatus.currentWeek] = week
            setAppStatus(newAppStatus)
        },
        onSubmit: (ev:KeyboardEvent|FormEvent|undefined, appStatus:Status , daySelector: number, textPrompt: string, setTextPrompt:Dispatch<SetStateAction<string>>): void => {
            if(ev){
                ev.preventDefault()
            }

            if(textPrompt !== ""){
                appMethods.createTask(appStatus, daySelector, textPrompt)
            }
            setTextPrompt("")
        },
        cloneWeek: (week:Week): Week => {
            let clonedWeek: Week = {days: []}
            week.days.forEach((day, i) => {
                clonedWeek.days[i] = appMethods.cloneDay(day)
            })

            return clonedWeek
        },
        cloneDay: (day:Day):Day => {
            let clonedDay: Day = {tasks: []}

            clonedDay.tasks.forEach(task => {
                clonedDay.tasks.push({...task})
            })

            return day
        }
    }

    return { appStatus, appMethods }
}
