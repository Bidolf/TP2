import psycopg2


def retrieve_xml_group_by_file():
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
                            SELECT xml, file_name FROM imported_documents WHERE active = TRUE 
                            """
        cursor.execute(obtain_xml)
        results_xml = cursor.fetchall()
        for result in results_xml:
            xml.append({'sub_xml': result[0], 'file_name': result[1]})
        print(f"XML was obtained successfully ")

    except (Exception, psycopg2.Error) as error:
        print("Failed to retrieve schema", error)

    finally:
        if connection:
            cursor.close()
            connection.close()
    return xml
