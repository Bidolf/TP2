import psycopg2


def db_available_files_delete():
    connection = None
    cursor = None
    files = []
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        cursor.execute('SELECT file_name FROM "xml_table" WHERE active = TRUE')
        file_names = cursor.fetchall()

        for file_name in file_names:
            files.append(file_name[0])
    except (Exception, psycopg2.Error) as error:
        print("Failed to return available files", error, flush=True)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return files


def db_delete(file):
    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        cursor.execute('SELECT 1 FROM "xml_table" WHERE file_name = %s', (file,))
        file_delete = cursor.fetchone()[0]
        if file_delete:
            cursor.execute('UPDATE "xml_table" SET active = FALSE WHERE file_name = %s', (file,))
            connection.commit()
            print(f"File {file} has been soft-deleted", flush=True)
        else:
            print(f"File {file} not available or already deleted", flush=True)

    except (Exception, psycopg2.Error) as error:
        print("Failed to remove file", error, flush=True)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1
