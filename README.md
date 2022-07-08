**Important note**: This project is just starting, and is not ready for production yet.

# NanoNVR

The tiniest NVR. Will not waste your CPU with unneeded bloat.
Let your camera do the work.

## Features

- Passthrough recording (with anything ffmpeg can handle)

That's all! We will not implement transcoding, motion detection, or any other
advanced features that your camera should be doing instead.

Thanks to the limited features we provide, NanoNVR can run on lightweight
devices, such as a Raspberry, even if you're handling multiple 4k cameras.

## Usage

This is a standard Node project. The usual steps apply:

```sh
yarn
yarn start
```

As soon as it starts, it will print the address you can use to access the web interface.
