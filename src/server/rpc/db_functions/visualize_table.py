import psycopg2


def visualize_table():
    connection = None
    cursor = None
    result=[]
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        visualize_table_query = """
                SELECT id, file_name, active FROM imported_documents
                """
        cursor.execute(visualize_table_query)
        rows = cursor.fetchall()
        for row in rows:
            result.append(row)

    except (Exception, psycopg2.Error) as error:
        print("Failed to return table", error, flush=True)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return result
