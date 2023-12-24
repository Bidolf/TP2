import psycopg2


def db_exists():
    connection = None
    cursor = None
    result = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        db_exists_query = """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_name = public.imported_documents
                    AND table_schema = 'public'
                );
            """
        table_name = "xml_table"
        cursor.execute(db_exists_query, (table_name,))
        result = cursor.fetchone()[0]
        print(f"Table exists on database? {result}", flush=True)

    except (Exception, psycopg2.Error) as error:
        print("Failed to verify if database exists", error, flush=True)

    finally:
        if connection:
            cursor.close()
            connection.close()

    return result
