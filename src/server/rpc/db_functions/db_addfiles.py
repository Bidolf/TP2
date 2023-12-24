import psycopg2


def db_available_files_add():
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
        cursor.execute('SELECT file_name FROM "xml_table" WHERE active = FALSE')
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


def db_addfiles(file):
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
        file_add = cursor.fetchone()[0]
        if file_add:
            cursor.execute('UPDATE "xml_table" SET active = TRUE WHERE file_name = %s', (file,))
            connection.commit()
            print(f"File {file} has been added", flush=True)
        else:
            print(f"File {file} not available or already added", flush=True)

    except (Exception, psycopg2.Error) as error:
        print("Failed to add file", error, flush=True)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1
