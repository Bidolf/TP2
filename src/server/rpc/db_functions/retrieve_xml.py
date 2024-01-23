import psycopg2


def retrieve_xml():
    connection = None
    cursor = None
    xml = []
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-xml",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        obtain_xml = """
                            SELECT xml FROM imported_documents WHERE active = TRUE
                            """
        cursor.execute(obtain_xml)
        results_xml = cursor.fetchall()
        for result in results_xml:
            xml.append(result[0])
        print(f"XML was obtained successfully ")

    except (Exception, psycopg2.Error) as error:
        print("Failed to retrieve schema", error)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return xml
