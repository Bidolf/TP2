import os

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
        cursor.execute('SELECT file_name FROM imported_documents WHERE active = FALSE')
        file_names = cursor.fetchall()

        for file_name in file_names:
            files.append(file_name[0])
    except (Exception, psycopg2.Error) as error:
        print("Failed to return available files", error)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return files


def obtainfile_name(path):
    file_name = os.path.basename(path)
    return file_name


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
        cursor.execute('SELECT 1 FROM imported_documents WHERE file_name = %s', (file,))
        file_add = cursor.fetchone()[0]
        if file_add:
            cursor.execute(
                'UPDATE imported_documents SET active = TRUE, updated_on = datetime.now() WHERE file_name = %s',
                (file,))
            cursor.execute(
                'UPDATE converted_documents SET active = TRUE, updated_on = datetime.now() WHERE obtainfile_name(dst) = %s',(file,))
            connection.commit()
            print(f"File {file} has been added")
        else:
            print(f"File {file} not available or already added")

    except (Exception, psycopg2.Error) as error:
        print("Failed to add file", error)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1
