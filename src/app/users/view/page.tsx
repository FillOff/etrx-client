"use client";
import { getUsers, GetUsersArgs } from "@/app/services/users";
import { LinkParamType, NetTable, NetTableParams, TableProps } from "@/app/components/network-table";

export default () =>
{
    function getData(params: NetTableParams)
    {
        let args = new GetUsersArgs(
            params.page,
            params.pageSize,
            params.sortField,
            params.sortOrder
        )
        return getUsers(args);
    }

    function usersTable()
    {
        let tableProps: TableProps = {
            getData: getData, 
            headTitles: ['ID', 'Хендл', 'Имя', 'Фамилия', 'Организация', 'Город', 'Класс'],
            dataField: 'users',
            link: 'https://codeforces.com/profile',
            paramType: LinkParamType.Appended,
            linkAppendedParamField: 'handle'
        };

        return(
            <NetTable props={tableProps}/>
        );
    }

    return(
        <>
            <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица пользователей</h1>
            {usersTable()}
        </>
    );
}