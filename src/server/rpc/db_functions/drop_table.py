import psycopg2


def drop_table():
    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        drop_table_query = """
                DROP TABLE "xml_table"
                """
        cursor.execute(drop_table_query)
        connection.commit()

    except (Exception, psycopg2.Error) as error:
        print("Failed to drop table", error, flush=True)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1
