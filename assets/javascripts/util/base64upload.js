function Base64FileUploadAdapter(loader) {

    this.loader = loader;

    this.upload = () => {
  
        return new Promise( ( resolve, reject ) => {
            const reader = this.reader = new window.FileReader();

            reader.addEventListener( 'load', () => {
                resolve( { default: reader.result } );
            } );
            
            reader.addEventListener( 'error', err => {
                reject( err );
            } );

            reader.addEventListener( 'abort', () => {
                reject();
            } );

            this.loader.file.then( file => {
                reader.readAsDataURL( file );
            } );

        } );

    }

    this.abort = () => {
        this.reader.abort();
    }

}

function Base64CustomUploadAdapterPlugin( editor ) {
    
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
        return new Base64FileUploadAdapter( loader );
    };

}