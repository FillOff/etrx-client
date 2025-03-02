import Styles from "../components/network-table.module.css";

export default function Page()
{
    return(
        <>
        <h1 className="m-auto text-center text-2xl md:text-3xl font-bold">Обновления</h1>
        <div className={Styles.container}>
            <table className={Styles.table}>
                <thead>
                    <tr>
                        <th className={Styles.th}>Версия</th>
                        <th className={Styles.th}>Изменения</th>    
                    </tr>
                </thead>
                <tbody>
                <tr>
                        <td className={Styles.cell}>
                            <div className="text-center">2.3.2025</div>
                        </td>
                        <td className={Styles.cell}>
                            <div className="ml-8">
                                <ul className="w-[80%] list-disc">
                                    <li>Переделано/Изменено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Все фильтры теперь располагается горизонтально</li>
                                                <li>Теперь на странице контеста отображается его название и номер</li>       
                                            </ul>
                                        </div>
                                    </li>
                                    <li>Исправлено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Вроде как исправлена проблема с пользователями, которые не отображались из-за измененного хендла</li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className={Styles.cell}>
                            <div className="text-center">11.1.2025</div>
                        </td>
                        <td className={Styles.cell}>
                            <div className="ml-8">
                                <ul className="w-[80%] list-disc">
                                    <li>Добавлено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Фильтрация по индексам (если выбрать несколько индексов, будут выведены все задачи с подобными индексами)</li>
                                                <li>Поиск по названию задачи</li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li>Переделано/Изменено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Версионизация приложения. Теперь версия и билд отображены справа сверху, также теперь версии это даты обновления</li>
                                                <li>Изменена данная таблица обновлений</li>       
                                                <li>Теперь дата отображается в формате &quot;Month dd yyyy&quot;</li>                                              
                                            </ul>
                                        </div>
                                    </li>
                                    <li>Исправлено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Названия задач были на английском. Сейчас же большинство задач имеют название на русском языке</li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className={Styles.cell}>
                            <div className="text-center">5.1.2025</div>
                        </td>
                        <td className={Styles.cell}>
                            <div className="ml-8">
                                <ul className="w-[80%] list-disc">
                                    <li>Добавлено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Таблица задач</li>
                                                <li>Фильтрация задач по тегам</li>
                                                <li>Фильтрация по типу участия в попытках пользователей</li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li>Переделано/Изменено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Отображаемые данные в попытках пользователей</li>
                                                <li>Фильтр соревнований/тренировок</li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li>Исправлено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Данные при выводе всех попыток пользователя были некорректными</li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className={Styles.cell}>
                            <div className="text-center">8.12.2024</div>
                        </td>
                        <td className={Styles.cell}>
                            <div className="ml-8">
                                <ul className="w-[80%] list-disc">
                                    <li>Добавлено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Страница о сайте, т.е. данная страница</li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li>Переделано/Изменено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Отображение попыток в таблице контеста</li>
                                                <li>Боковая панель</li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li>Исправлено
                                        <div className="ml-6">
                                            <ul className="list-circle">
                                                <li>Таблица контестов теперь корректно обновляется при выборе фильтра</li>
                                                <li>Запросы данных контестов</li>
                                                <li>Сортировка таблицы пользователей</li>
                                                <li>Некорректный стиль для фона фильтров у таблицы контестов</li>
                                                <li>Отображение иконок в боковом меню</li>
                                                <li>Размеры и положение кнопки бокового меню</li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        </>
    )
}
