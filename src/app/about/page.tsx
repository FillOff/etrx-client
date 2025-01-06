

export default function Page()
{
    return(
        <>
        <h1 className="m-auto text-center text-2xl md:text-3xl font-bold">Обновления</h1>
        <div className="ml-8 text-lg">
            <label>v0.8.0 - 05.01.2025</label>
            <ul className="border-b-[1px] border-dashed w-[80%] list-disc">
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
        <div className="ml-8 text-lg">
            <label>v0.7.0 - 08.12.2024</label>
            <ul className="border-b-[1px] border-dashed w-[80%] list-disc">
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
        </>
    )
}
